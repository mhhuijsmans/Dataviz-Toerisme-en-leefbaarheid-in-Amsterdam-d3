var marginStad1 = {top: 20, right: 20, bottom: 30, left: 80},
    widthStad1 = 350 - marginStad1.left - marginStad1.right,
    heightStad1 = 300 - marginStad1.top - marginStad1.bottom;

d3.queue()
    .defer(d3.csv, 'data/filter.csv')
    .defer(d3.csv, 'data/stadsdelen.csv')
    .defer(d3.csv, 'data/attractie_museum.csv')
    .defer(d3.csv, 'data/hotels.csv')
    .defer(d3.csv, 'data/airbnb.csv')
    .defer(d3.json, 'data/bevolking.json')
    .defer(d3.csv, 'data/hotelovernachtingen.csv')
    .defer(d3.csv, 'data/buurttevredenheid.csv')
    .await(doTheMagic);

function doTheMagic(error, filternamen, stadsdeeldata, museadata, hotelsdata, airbnbdata, bevolkingsdata, overnachtingsdata, buurttevredenheiddata) {
    
    hotelsArray = new Array();
    calcData = new Array();
    
    bevolkingsdata.forEach(function(d,i){
        calcData[i] = new Array();
        calcData[i].stadsdeel = d.stadsdeel;
        calcData[i].bewoners = d.jaartallen[0]['2016'];
    });
    
    stadsdeeldata.forEach(function(d,i){
        calcData[i].oppervlakte = +d.km2;
    });
    
    hotelsstadsdeel = d3.nest()
        .key(function(d){
            return d.stadsdeel;
        })
        .sortKeys(d3.ascending)
        .entries(hotelsdata);
    
    hotelsstadsdeel.forEach(function(d){
        hotelsArray.push([d.key,d.values.length]);
    });
    
    hotelsArray.splice(0, 0, ['Amsterdam',hotelsdata.length]);
    hotelsArray.splice(6, 0, ['Westpoort',0]);
    
    $.each(hotelsArray, function(i, value) {
        calcData[i].hotels = value[1];
    });
    
    calcData.forEach(function(d){
        d.bewonerskm2 = Math.round(d.bewoners / d.oppervlakte);
        d.hotelskm2 = parseFloat((d.hotels / d.oppervlakte).toFixed(1));
    });
    
    buurttevredenheiddata.forEach(function(d,i){
        calcData[i].cijfer = +d['2015'];
    });
    
    console.log(calcData)
    
    
    var currentStadsdeel = 'Amsterdam';
    
    var currentAdamDashboard = 'adam1';
    var currentStadDashboard = 'stad1';

//-----------------------------------//
//               KAART               //
//-----------------------------------//
    var amsterdam = d3.select('#amsterdam');
    
    var mapcontainer = d3.select('#amsterdam #container');

    var kaart = d3.select('#Kaart');

    var svgSize = $('#Kaart')[0].getBBox();

    var xScale = d3.scale.linear()
        .domain([4.728768,5.079164])
        .range([0,svgSize.width]);

    var yScale = d3.scale.linear()
        .domain([52.431057,52.278169])
        .range([0,svgSize.height]);

    var tipgraph = d3.tip()
        .attr('class','tipgraph')
        .offset([0, 30])
        .html(function(d){
            return "<span>" + d.aantal + "</span>";
        });

    var tipgraph2 = d3.tip()
        .attr('class','tipgraph')
        .offset([0, 30])
        .html(function(d){
            return "<span>" + d.overnachtingen + "</span>";
        });

    amsterdam.call(tipgraph);
    amsterdam.call(tipgraph2);

    var tip = d3.tip()
        .attr('class','musea-tooltip')
        .offset([200, 200])
        .html(function(d){
            if (d.attractie_museum == 'museum') {
                icon = "<?xml version='1.0' encoding='UTF-8' standalone='no'?> <svg width='75px' height='75px' viewBox='0 0 75 75' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><title>Musea</title> <desc>Created with Sketch.</desc> <defs> <rect id='path-1' x='0' y='0' width='25' height='28'></rect> <mask id='mask-2' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='25' height='28' fill='white'> <use xlink:href='#path-1'></use> </mask> <rect id='path-3' x='3' y='3' width='19' height='22'></rect> <mask id='mask-4' maskContentUnits='userSpaceOnUse' maskUnits='objectBoundingBox' x='0' y='0' width='19' height='22' fill='white'> <use xlink:href='#path-3'></use> </mask> </defs> <g id='Illustraties' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Musea'> <g id='illus' transform='translate(20.000000, 12.000000)'> <g id='Painting' transform='translate(6.500000, 0.000000)'> <use id='Rectangle-5' stroke='#FFFFFF' mask='url(#mask-2)' stroke-width='2' xlink:href='#path-1'></use> <use id='Rectangle-5' stroke='#FFFFFF' mask='url(#mask-4)' stroke-width='2' xlink:href='#path-3'></use> <polygon id='Triangle' stroke='#FFFFFF' points='21.4987095 23.9653181 21.4987095 24.5 10.8056641 24.5 17 18.6327383'></polygon> <polygon id='Triangle' stroke='#FFFFFF' fill='#FE5A4B' points='17 24.5 3.51651846 24.5 3.51651846 19.8223877 9 14.7502958'></polygon> <polygon id='Triangle' fill='#FFFFFF' opacity='0.25' points='18.4834815 22.9997042 5 22.9997042 5 18.3220919 10.4834815 13.25'></polygon> <circle id='Oval' fill='#FFFFFF' cx='17' cy='9' r='1'></circle> </g> <g id='palen' transform='translate(0.000000, 34.000000)' stroke='#FFFFFF' stroke-linecap='square'> <path d='M8.5,1.5 L8.5,15.5' id='Line'></path> <path d='M29.5,1.5 L29.5,15.5' id='Line-Copy'></path> <path d='M0.0495853369,5.39597734 C5.35636123,4.67914103 8.50651443,0.5 8.50651443,0.5 C8.50651443,0.5 12.0605677,5.5 18.9514482,5.5 C25.8423287,5.5 29.4958721,0.5 29.4958721,0.5 C29.4958721,0.5 32.6442339,4.74575443 38.0654726,5.41239023' id='Line'></path> </g> </g> </g> </g> </svg>";
            }
            else { 
                icon = "<?xml version='1.0' encoding='UTF-8' standalone='no'?><svg width='75px' height='75px' viewBox='0 0 75 75' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <title>Attractie</title> <desc>Created with Sketch.</desc> <defs></defs> <g id='Illustraties' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='Attractie'> <g id='illus' transform='translate(12.000000, 9.000000)'> <circle id='Oval-2' stroke='#FFFFFF' cx='25.5' cy='25' r='25'></circle> <circle id='Oval-2' stroke='#FFFFFF' cx='25.5' cy='25' r='21'></circle> <circle id='Oval-2' stroke='#FFFFFF' cx='25.5' cy='25' r='11'></circle> <path d='M25.5,4.5 L25.5,46.5' id='Line' stroke='#FFFFFF' stroke-linecap='square'></path> <path d='M44.5031247,25 L4.49725283,25' id='Line' stroke='#FFFFFF' stroke-linecap='square'></path> <path d='M39.2504904,38.7517529 L11.248374,10.7496366' id='Line' stroke='#FFFFFF' stroke-linecap='square'></path> <path d='M10.2484045,40.2503329 L40.2504156,10.2483218' id='Line' stroke='#FFFFFF' stroke-linecap='square'></path> <path d='M11.5,58.5 L25.5,25' id='Line' stroke='#FFFFFF' stroke-linecap='square'></path> <path d='M39.5,58.5 L25.5,25' id='Line' stroke='#FFFFFF' stroke-linecap='square'></path> <path d='M25.5,5.10015675 C27.1568542,5.10015675 28.5,3.757011 28.5,2.10015675 C28.5,2.06663995 28.4963667,2 28.4963667,2 L22.5,2 C22.5,2 22.5,2.05923721 22.5,2.10015675 C22.5,3.757011 23.8431458,5.10015675 25.5,5.10015675 Z' id='Oval-5' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M25.5,48.1001567 C27.1568542,48.1001567 28.5,46.757011 28.5,45.1001567 C28.5,45.0666399 28.4963667,45 28.4963667,45 L22.5,45 C22.5,45 22.5,45.0592372 22.5,45.1001567 C22.5,46.757011 23.8431458,48.1001567 25.5,48.1001567 Z' id='Oval-5' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M40.5,41.6001567 C42.1568542,41.6001567 43.5,40.257011 43.5,38.6001567 C43.5,38.5666399 43.4963667,38.5 43.4963667,38.5 L37.5,38.5 C37.5,38.5 37.5,38.5592372 37.5,38.6001567 C37.5,40.257011 38.8431458,41.6001567 40.5,41.6001567 Z' id='Oval-5-Copy' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M10.5,11.6001567 C12.1568542,11.6001567 13.5,10.257011 13.5,8.60015675 C13.5,8.56663995 13.4963667,8.5 13.4963667,8.5 L7.5,8.5 C7.5,8.5 7.5,8.55923721 7.5,8.60015675 C7.5,10.257011 8.84314575,11.6001567 10.5,11.6001567 Z' id='Oval-5' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M40.5,11.6001567 C42.1568542,11.6001567 43.5,10.257011 43.5,8.60015675 C43.5,8.56663995 43.4963667,8.5 43.4963667,8.5 L37.5,8.5 C37.5,8.5 37.5,8.55923721 37.5,8.60015675 C37.5,10.257011 38.8431458,11.6001567 40.5,11.6001567 Z' id='Oval-5-Copy-2' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M10.5,41.6001567 C12.1568542,41.6001567 13.5,40.257011 13.5,38.6001567 C13.5,38.5666399 13.4963667,38.5 13.4963667,38.5 L7.5,38.5 C7.5,38.5 7.5,38.5592372 7.5,38.6001567 C7.5,40.257011 8.84314575,41.6001567 10.5,41.6001567 Z' id='Oval-5' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M45.5,26.6001567 C47.1568542,26.6001567 48.5,25.257011 48.5,23.6001567 C48.5,23.5666399 48.4963667,23.5 48.4963667,23.5 L42.5,23.5 C42.5,23.5 42.5,23.5592372 42.5,23.6001567 C42.5,25.257011 43.8431458,26.6001567 45.5,26.6001567 Z' id='Oval-5' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M5.5,26.6001567 C7.15685425,26.6001567 8.5,25.257011 8.5,23.6001567 C8.5,23.5666399 8.49636669,23.5 8.49636669,23.5 L2.5,23.5 C2.5,23.5 2.5,23.5592372 2.5,23.6001567 C2.5,25.257011 3.84314575,26.6001567 5.5,26.6001567 Z' id='Oval-5' stroke='#FFFFFF' fill='#FE5A4B'></path> <path d='M25.5,4.10015675 C27.1568542,4.10015675 28.5,2.757011 28.5,1.10015675 C28.5,1.06663995 28.4963667,1 28.4963667,1 L22.5,1 C22.5,1 22.5,1.05923721 22.5,1.10015675 C22.5,2.757011 23.8431458,4.10015675 25.5,4.10015675 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M10.5,10.6001567 C12.1568542,10.6001567 13.5,9.257011 13.5,7.60015675 C13.5,7.56663995 13.4963667,7.5 13.4963667,7.5 L7.5,7.5 C7.5,7.5 7.5,7.55923721 7.5,7.60015675 C7.5,9.257011 8.84314575,10.6001567 10.5,10.6001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M40.5,10.6001567 C42.1568542,10.6001567 43.5,9.257011 43.5,7.60015675 C43.5,7.56663995 43.4963667,7.5 43.4963667,7.5 L37.5,7.5 C37.5,7.5 37.5,7.55923721 37.5,7.60015675 C37.5,9.257011 38.8431458,10.6001567 40.5,10.6001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M5.5,25.6001567 C7.15685425,25.6001567 8.5,24.257011 8.5,22.6001567 C8.5,22.5666399 8.49636669,22.5 8.49636669,22.5 L2.5,22.5 C2.5,22.5 2.5,22.5592372 2.5,22.6001567 C2.5,24.257011 3.84314575,25.6001567 5.5,25.6001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M10.5,40.6001567 C12.1568542,40.6001567 13.5,39.257011 13.5,37.6001567 C13.5,37.5666399 13.4963667,37.5 13.4963667,37.5 L7.5,37.5 C7.5,37.5 7.5,37.5592372 7.5,37.6001567 C7.5,39.257011 8.84314575,40.6001567 10.5,40.6001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M40.5,40.6001567 C42.1568542,40.6001567 43.5,39.257011 43.5,37.6001567 C43.5,37.5666399 43.4963667,37.5 43.4963667,37.5 L37.5,37.5 C37.5,37.5 37.5,37.5592372 37.5,37.6001567 C37.5,39.257011 38.8431458,40.6001567 40.5,40.6001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M25.5,47.1001567 C27.1568542,47.1001567 28.5,45.757011 28.5,44.1001567 C28.5,44.0666399 28.4963667,44 28.4963667,44 L22.5,44 C22.5,44 22.5,44.0592372 22.5,44.1001567 C22.5,45.757011 23.8431458,47.1001567 25.5,47.1001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <path d='M45.5,25.6001567 C47.1568542,25.6001567 48.5,24.257011 48.5,22.6001567 C48.5,22.5666399 48.4963667,22.5 48.4963667,22.5 L42.5,22.5 C42.5,22.5 42.5,22.5592372 42.5,22.6001567 C42.5,24.257011 43.8431458,25.6001567 45.5,25.6001567 Z' id='Oval-5' fill='#FFFFFF' opacity='0.25'></path> <circle id='Oval-6' stroke='#FFFFFF' fill='#FE5A4B' cx='25.5' cy='25' r='3'></circle> <circle id='Oval-6' fill='#FFFFFF' opacity='0.25' cx='25.5' cy='25' r='3'></circle> </g> </g> </g></svg>"
            };
            return "<div class='circle'>" + icon + "</div><span class='naam'>" + d.naam + "</span><span class='percentage'>" + d.percentage_bezoekers + "%</span><span class='aantal'>van 8645 bezoekers</span>";
        });

    amsterdam.call(tip);




//-----------------------------------//
//             DASHBOARD             //
//-----------------------------------//
    var dashboard = d3.select('#dashboard');
    $('#qmark').click(function(){
        $('.popup').removeClass('is-hidden');
    });
    
    $('#popup__cross').click(function(){
        $('.popup').addClass('is-hidden');
    });
    
    //---------------------//
    //        ADAM 1       //
    //---------------------//
    var adam1 = dashboard
        .append('g')
        .attr('id','adam1')
        .attr('class','adamdash');
    
    var scrollAdam1 = adam1
        .append('g')
        .attr('class','scrolltext scrollAdam1');
    
    scrollAdam1
        .append('text')
        .attr('class','scrolltext textAdam1')
        .text('Scroll');
    
    var scrollAdam1textSize = $('.scrolltext.textAdam1')[0].getBBox();
    
    var arrowAdam1 = scrollAdam1
        .append('g')
        .attr('class','arrow arrowAdam1')
        .attr('transform','scale(.6) translate(' + (scrollAdam1textSize.width + 80) + ',' + - (scrollAdam1textSize.height + 10) + ')');
    
    arrowAdam1
        .append('path')
        .attr('d','M16.317,32.634c-0.276,0-0.5-0.224-0.5-0.5V0.5c0-0.276,0.224-0.5,0.5-0.5s0.5,0.224,0.5,0.5v31.634 C16.817,32.41,16.593,32.634,16.317,32.634z');
    
    arrowAdam1
        .append('path')
        .attr('d','M16.315,32.634L16.315,32.634c-0.133,0-0.26-0.053-0.354-0.146L3.428,19.951c-0.195-0.195-0.195-0.512,0-0.707 s0.512-0.195,0.707,0l12.179,12.183l12.184-12.183c0.195-0.195,0.512-0.195,0.707,0s0.195,0.512,0,0.707L16.668,32.487	C16.574,32.581,16.448,32.634,16.315,32.634z');
    
    //bewoners
    var bewoners = adam1
        .append('g')
        .attr('id','bewoners')
        .attr('class','graphtrigger');
    
    var bewonersBG = bewoners
        .append('rect');
    
    bewoners
        .append('text')
        .attr('class','bewoners bewoners1')
        .text('834713');
    
    bewoners
        .append('text')
        .attr('class','bewoners bewoners2')
        .text('Bewoners');
    
    
    //bars
    var barsbewoners = bewoners
        .append('g')
        .attr('id','bars__bewoners')
        .attr('class','bars');
    
    barsbewoners
        .append('rect')
        .attr('class','bar bar1')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsbewoners
        .append('rect')
        .attr('class','bar bar2')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsbewoners
        .append('rect')
        .attr('class','bar bar3')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsbewoners
        .append('rect')
        .attr('class','bar bar4')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    var bewonersSize = $('#bewoners')[0].getBBox();
    bewonersBG
        .attr('class','bgrect')
        .attr('width',bewonersSize.width)
        .attr('height',bewonersSize.height)
        .attr('x',bewonersSize.x)
        .attr('y',bewonersSize.y);
    
    
    //lijn1
    adam1
        .append('rect')
        .attr('class','scheidingslijn lijn1')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //overnachtingen
    var overnachting = adam1
        .append('g')
        .attr('id','overnachting')
        .attr('class','graphtrigger');
    
    var overnachtingBG = overnachting
        .append('rect');
    
    overnachting
        .append('text')
        .attr('class','overnachting overnachting1')
        .text('6826000');
    
    overnachting
        .append('text')
        .attr('class','overnachting overnachting2')
        .text('Hotelgasten');
    
    
    //bars
    var barsovernachting = overnachting
        .append('g')
        .attr('id','bars__overnachting')
        .attr('class','bars');
    
    barsovernachting
        .append('rect')
        .attr('class','bar bar1')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsovernachting
        .append('rect')
        .attr('class','bar bar2')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsovernachting
        .append('rect')
        .attr('class','bar bar3')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsovernachting
        .append('rect')
        .attr('class','bar bar4')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    var overnachtingSize = $('#overnachting')[0].getBBox();
    overnachtingBG
        .attr('class','bgrect')
        .attr('width',overnachtingSize.width)
        .attr('height',overnachtingSize.height)
        .attr('x',overnachtingSize.x)
        .attr('y',overnachtingSize.y);
    
    
    //lijn2
    adam1
        .append('rect')
        .attr('class','scheidingslijn lijn2')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //gastenperbewoner
    var gastenperbewoner = adam1
        .append('g')
        .attr('id','gastenperbewoner');
    
    gastenperbewoner
        .append('text')
        .attr('class','gastenperbewoner gastenperbewoner1')
        .text('8.2');
    
    gastenperbewoner
        .append('text')
        .attr('class','gastenperbewoner gastenperbewoner2')
        .text('Hotelgasten per bewoner');
    
    
    //---------------------//
    //        ADAM 2       //
    //---------------------//
    var adam2 = dashboard
        .append('g')
        .attr('id','adam2')
        .attr('class','adamdash hide-dashboard1');
    
    var scrollAdam2 = adam2
        .append('g')
        .attr('class','scrolltext scrollAdam2');
    
    scrollAdam2
        .append('text')
        .attr('class','scrolltext textAdam2')
        .text('Scroll');
    
    var scrollAdam2textSize = $('.scrolltext.textAdam2')[0].getBBox();
    
    var arrowAdam2 = scrollAdam2
        .append('g')
        .attr('class','arrow arrowAdam2')
        .attr('transform','scale(.6) translate(' + (scrollAdam2textSize.width + 80) + ',' + - (scrollAdam2textSize.height + 10) + ')');
    
    arrowAdam2
        .append('path')
        .attr('d','M16.317,32.634c-0.276,0-0.5-0.224-0.5-0.5V0.5c0-0.276,0.224-0.5,0.5-0.5s0.5,0.224,0.5,0.5v31.634 C16.817,32.41,16.593,32.634,16.317,32.634z');
    
    arrowAdam2
        .append('path')
        .attr('d','M16.315,32.634L16.315,32.634c-0.133,0-0.26-0.053-0.354-0.146L3.428,19.951c-0.195-0.195-0.195-0.512,0-0.707 s0.512-0.195,0.707,0l12.179,12.183l12.184-12.183c0.195-0.195,0.512-0.195,0.707,0s0.195,0.512,0,0.707L16.668,32.487	C16.574,32.581,16.448,32.634,16.315,32.634z');
    
    //bevolkingsdichtheid
    var bevolkingsdichtheid = adam2
        .append('g')
        .attr('id','bevolkingsdichtheid');
    
    bevolkingsdichtheid
        .append('text')
        .attr('class','bewoners bevolkingsdichtheid1')
        .text('4994');
    
    bevolkingsdichtheid
        .append('text')
        .attr('class','bewoners bevolkingsdichtheid2')
        .text('Bevolkingsdichtheid per km²');
    
    
    //lijn1
    adam2
        .append('rect')
        .attr('class','scheidingslijn lijn1')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //hotelsperkm2
    var hotelsperkm2 = adam2
        .append('g')
        .attr('id','hotelsperkm2');
    
    hotelsperkm2
        .append('text')
        .attr('class','hotelsperkm2 hotelsperkm21')
        .text('2.1');
    
    hotelsperkm2
        .append('text')
        .attr('class','hotelsperkm2 hotelsperkm22')
        .text('Aantal hotels per km²');
    
    
    //lijn2
    adam2
        .append('rect')
        .attr('class','scheidingslijn lijn2')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //woningperkm2
    var woningperkm2 = adam2
        .append('g')
        .attr('id','woningperkm2');
    
    woningperkm2
        .append('text')
        .attr('class','woningperkm2 woningperkm21')
        .text('2533');
    
    woningperkm2
        .append('text')
        .attr('class','woningperkm2 woningperkm22')
        .text('Woningdichtheid per km²');
    
    
    //---------------------//
    //        ADAM 3       //
    //---------------------//
    var adam3 = dashboard
        .append('g')
        .attr('id','adam3')
        .attr('class','adamdash hide-dashboard');
    
    var scrollAdam3 = adam3
        .append('g')
        .attr('class','scrolltext scrollAdam3');
    
    scrollAdam3
        .append('text')
        .attr('class','scrolltext textAdam3')
        .text('Scroll');
    
    var scrollAdam3textSize = $('.scrolltext.textAdam3')[0].getBBox();
    
    var arrowAdam3 = scrollAdam3
        .append('g')
        .attr('class','arrow arrowAdam3')
        .attr('transform','scale(.6) translate(' + (scrollAdam3textSize.width + 80) + ',' + - (scrollAdam3textSize.height + 10) + ')');
    
    arrowAdam3
        .append('path')
        .attr('d','M16.317,32.634c-0.276,0-0.5-0.224-0.5-0.5V0.5c0-0.276,0.224-0.5,0.5-0.5s0.5,0.224,0.5,0.5v31.634 C16.817,32.41,16.594,32.634,16.317,32.634z');
    
    arrowAdam3
        .append('path')
        .attr('d','M28.852,13.536c-0.128,0-0.256-0.049-0.354-0.146L16.319,1.207L4.135,13.39c-0.195,0.195-0.512,0.195-0.707,0 s-0.195-0.512,0-0.707L15.966,0.146C16.059,0.053,16.186,0,16.319,0l0,0c0.133,0,0.26,0.053,0.354,0.146l12.533,12.536		c0.195,0.195,0.195,0.512,0,0.707C29.108,13.487,28.98,13.536,28.852,13.536z');
    
    
    
    //buurtpunten tekst
    var buurtpuntentekst = adam3
        .append('g')
        .attr('id','buurtpuntentekst');
    
    buurtpuntentekst
        .append('text')
        .attr('class','kopje')
        .text('Buurttevredenheid');
    
    var buurtpuntendef = buurtpuntentekst
        .append('g')
        .attr('id','buurtpuntendef');
    
    buurtpuntendef
        .append('text')
        .attr('class','def def1')
        .text('Geeft een beeld van hoe de bewoners van Amsterdam denken ');
    
    buurtpuntendef
        .append('text')
        .attr('class','def def2')
        .text('over de leefbaarheid in hun buurt. Bewoners kennen een cijfer');
    
    buurtpuntendef
        .append('text')
        .attr('class','def def3')
        .text('toe aan verschillende factoren zoals schoon, veilig en prettig');
    
    buurtpuntendef
        .append('text')
        .attr('class','def def4')
        .text('samenleven.');
    
    
    //lijn3
    adam3
        .append('rect')
        .attr('class','scheidingslijn lijn3')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //oordeelAdam
    var oordeelAdam = adam3
        .append('g')
        .attr('id','oordeelAdam')
        .attr('class','graphtrigger');
    
    var oordeelAdamBG = oordeelAdam
        .append('rect');
    
    oordeelAdam
        .append('text')
        .attr('class','oordeelAdam oordeelAdam1')
        .text('7.5');
    
    oordeelAdam
        .append('text')
        .attr('class','oordeelAdam oordeelAdam2')
        .text('Totaal oordeel Amsterdam');
    
    
    //bars
    var barsoordeelAdam = oordeelAdam
        .append('g')
        .attr('id','bars__oordeelAdam')
        .attr('class','bars');
    
    barsoordeelAdam
        .append('rect')
        .attr('class','bar bar1')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsoordeelAdam
        .append('rect')
        .attr('class','bar bar2')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsoordeelAdam
        .append('rect')
        .attr('class','bar bar3')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsoordeelAdam
        .append('rect')
        .attr('class','bar bar4')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    var oordeelAdamSize = $('#oordeelAdam')[0].getBBox();
    oordeelAdamBG
        .attr('class','bgrect')
        .attr('width',oordeelAdamSize.width)
        .attr('height',oordeelAdamSize.height)
        .attr('x',oordeelAdamSize.x)
        .attr('y',oordeelAdamSize.y);
    
    
    //---------------------//
    //        STAD 1       //
    //---------------------//
    var stad1 = dashboard
        .append('g')
        .attr('id','stad1')
        .attr('class','staddash is-hidden');
    
    var scrollStad1 = stad1
        .append('g')
        .attr('class','scrolltext scrollStad1');
    
    scrollStad1
        .append('text')
        .attr('class','scrolltext textStad1')
        .text('Scroll');
    
    var scrollStad1textSize = $('.scrolltext.textStad1')[0].getBBox();
    
    var arrowStad1 = scrollStad1
        .append('g')
        .attr('class','arrow arrowStad1')
        .attr('transform','scale(.6) translate(' + (scrollStad1textSize.width + 80) + ',' + - (scrollStad1textSize.height + 10) + ')');
    
    arrowStad1
        .append('path')
        .attr('d','M16.317,32.634c-0.276,0-0.5-0.224-0.5-0.5V0.5c0-0.276,0.224-0.5,0.5-0.5s0.5,0.224,0.5,0.5v31.634 C16.817,32.41,16.593,32.634,16.317,32.634z');
    
    arrowStad1
        .append('path')
        .attr('d','M16.315,32.634L16.315,32.634c-0.133,0-0.26-0.053-0.354-0.146L3.428,19.951c-0.195-0.195-0.195-0.512,0-0.707 s0.512-0.195,0.707,0l12.179,12.183l12.184-12.183c0.195-0.195,0.512-0.195,0.707,0s0.195,0.512,0,0.707L16.668,32.487	C16.574,32.581,16.448,32.634,16.315,32.634z');
    
    
    //bewoners
    var bewonersStad = stad1
        .append('g')
        .attr('id','bewonersStad')
        .attr('class','graphtrigger');
    
    var bewonersStadBG = bewonersStad
        .append('rect');
    
    bewonersStad
        .append('text')
        .attr('class','bewonersStad bewonersStad1')
        .text('834713');
    
    bewonersStad
        .append('text')
        .attr('class','bewonersStad bewonersStad2')
        .text('Bewoners in 2015');
    
    
    //bars
    var barsbewonersStad = bewonersStad
        .append('g')
        .attr('id','bars__bewonersStad')
        .attr('class','bars');
    
    barsbewonersStad
        .append('rect')
        .attr('class','bar bar1')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsbewonersStad
        .append('rect')
        .attr('class','bar bar2')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsbewonersStad
        .append('rect')
        .attr('class','bar bar3')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsbewonersStad
        .append('rect')
        .attr('class','bar bar4')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    var bewonersStadSize = $('#bewonersStad')[0].getBBox();
    bewonersStadBG
        .attr('class','bgrect')
        .attr('width',bewonersStadSize.width)
        .attr('height',bewonersStadSize.height)
        .attr('x',bewonersStadSize.x)
        .attr('y',bewonersStadSize.y);
    
    
    //lijn1
    stad1
        .append('rect')
        .attr('class','scheidingslijn lijn1')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //bewonerskm2
    var bewonersStadkm2 = stad1
        .append('g')
        .attr('id','bewonersStadkm2');
    
    bewonersStadkm2
        .append('text')
        .attr('class','bewonersStadkm2 bewonersStadkm21')
        .text('3806');
    
    bewonersStadkm2
        .append('text')
        .attr('class','bewonersStadkm2 bewonersStadkm22')
        .text('Bevolkingsdichtheid per km²');
    
    
    //lijn2
    stad1
        .append('rect')
        .attr('class','scheidingslijn lijn2')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //hotelskm2
    var hotelsStadkm2 = stad1
        .append('g')
        .attr('id','hotelsStadkm2');
    
    hotelsStadkm2
        .append('text')
        .attr('class','hotelsStadkm2 hotelsStadkm21')
        .text('2');
    
    hotelsStadkm2
        .append('text')
        .attr('class','hotelsStadkm2 hotelsStadkm22')
        .text('Hotels per km²');
    
    
    //---------------------//
    //        STAD 2       //
    //---------------------//
    var stad2 = dashboard
        .append('g')
        .attr('id','stad2')
        .attr('class','staddash hide-dashboard is-hidden');
    
    var scrollStad2 = stad2
        .append('g')
        .attr('class','scrolltext scrollStad2');
    
    scrollStad2
        .append('text')
        .attr('class','scrolltext textStad2')
        .text('Scroll');
    
    var scrollStad2textSize = $('.scrolltext.textStad2')[0].getBBox();
    
    var arrowStad2 = scrollStad2
        .append('g')
        .attr('class','arrow arrowStad2')
        .attr('transform','scale(.6) translate(' + (scrollStad2textSize.width + 80) + ',' + - (scrollStad2textSize.height + 10) + ')');
    
    arrowStad2
        .append('path')
        .attr('d','M16.317,32.634c-0.276,0-0.5-0.224-0.5-0.5V0.5c0-0.276,0.224-0.5,0.5-0.5s0.5,0.224,0.5,0.5v31.634 C16.817,32.41,16.593,32.634,16.317,32.634z');
    
    arrowStad2
        .append('path')
        .attr('d','M28.852,13.536c-0.128,0-0.256-0.049-0.354-0.146L16.319,1.207L4.135,13.39c-0.195,0.195-0.512,0.195-0.707,0 s-0.195-0.512,0-0.707L15.966,0.146C16.059,0.053,16.186,0,16.319,0l0,0c0.133,0,0.26,0.053,0.354,0.146l12.533,12.536		c0.195,0.195,0.195,0.512,0,0.707C29.108,13.487,28.98,13.536,28.852,13.536z');
    
    
    
    //buurtpunten tekst
    var buurtpuntenStadtekst = stad2
        .append('g')
        .attr('id','buurtpuntenStadtekst');
    
    buurtpuntenStadtekst
        .append('text')
        .attr('class','kopje')
        .text('Buurttevredenheid');
    
    var buurtpuntenStaddef = buurtpuntenStadtekst
        .append('g')
        .attr('id','buurtpuntenStaddef');
    
    buurtpuntenStaddef
        .append('text')
        .attr('class','def def1')
        .text('Geeft een beeld van hoe de bewoners van Amsterdam denken ');
    
    buurtpuntenStaddef
        .append('text')
        .attr('class','def def2')
        .text('over de leefbaarheid in hun buurt. Bewoners kennen een cijfer');
    
    buurtpuntenStaddef
        .append('text')
        .attr('class','def def3')
        .text('toe aan verschillende factoren zoals schoon, veilig en prettig');
    
    buurtpuntenStaddef
        .append('text')
        .attr('class','def def4')
        .text('samenleven.');
    
    
    //lijn3
    stad2
        .append('rect')
        .attr('class','scheidingslijn lijn3')
        .attr('width',bewonersSize.width)
        .attr('height',0.5);
    
    
    //oordeelStad
    var oordeelStad = stad2
        .append('g')
        .attr('id','oordeelStad')
        .attr('class','graphtrigger');
    
    var oordeelStadBG = oordeelStad
        .append('rect');
    
    oordeelStad
        .append('text')
        .attr('class','oordeelStad oordeelStad1')
        .text('7.5');
    
    oordeelStad
        .append('text')
        .attr('class','oordeelStad oordeelStad2')
        .text('Totaal oordeel buurt');
    
    
    //bars
    var barsoordeelStad = oordeelStad
        .append('g')
        .attr('id','bars__oordeelStad')
        .attr('class','bars');
    
    barsoordeelStad
        .append('rect')
        .attr('class','bar bar1')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsoordeelStad
        .append('rect')
        .attr('class','bar bar2')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsoordeelStad
        .append('rect')
        .attr('class','bar bar3')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    barsoordeelStad
        .append('rect')
        .attr('class','bar bar4')
        .attr('rx',2)
        .attr('ry',2)
        .attr('width',1);
    
    var oordeelStadSize = $('#oordeelStad')[0].getBBox();
    oordeelStadBG
        .attr('class','bgrect')
        .attr('width',oordeelStadSize.width)
        .attr('height',oordeelStadSize.height)
        .attr('x',oordeelStadSize.x)
        .attr('y',oordeelStadSize.y);
    
        function translateScrolltext() {
            var dashboardSize = [$('#dashboard').innerWidth(),$('#dashboard').innerHeight()];
            var scrollAdam1Size = $('.scrollAdam1')[0].getBBox();
            var scrollAdam2Size = $('.scrollAdam2')[0].getBBox();
            var scrollAdam3Size = $('.scrollAdam3')[0].getBBox();
            var scrollStad1Size = $('.scrollStad1')[0].getBBox();
            var scrollStad2Size = $('.scrollStad2')[0].getBBox();

            scrollAdam1.attr('transform','translate(' + (dashboardSize[0] - scrollAdam1Size.width - 25) + ',' + (dashboardSize[1] - scrollAdam1Size.height - 10) + ')');

            scrollAdam2.attr('transform','translate(' + (dashboardSize[0] - scrollAdam2Size.width - 25) + ',' + (dashboardSize[1] - scrollAdam2Size.height - 10) + ')');

            scrollAdam3.attr('transform','translate(' + (dashboardSize[0] - scrollAdam3Size.width - 25) + ',' + (dashboardSize[1] - scrollAdam3Size.height - 10) + ')');
            
            scrollStad1.attr('transform','translate(' + (dashboardSize[0] - scrollStad1Size.width - 25) + ',' + (dashboardSize[1] - scrollStad1Size.height - 10) + ')');
            
            scrollStad2.attr('transform','translate(' + (dashboardSize[0] - scrollStad2Size.width - 25) + ',' + (dashboardSize[1] - scrollStad2Size.height - 10) + ')');
        };

        translateScrolltext();

        $(window).on('resize', function(){
            translateScrolltext();
        });
    
    //-----------------//
    //     SELECTOR    //
    //-----------------//
    //stadsdeelselect
    var stadsdeelSelect = dashboard
        .append('g')
        .attr('id','stadsdeel-select');
    
    var stadsdeelSelectBG = stadsdeelSelect
        .append('rect')
        .attr('class','bgrect')
        .attr('width',475)
        .attr('height',175)
        .attr('x',-50)
        .attr('y',-138);

    stadsdeelSelect
        .append('text')
        .attr('class','loc loc1')
        .text('Hoe bewoners de');

    stadsdeelSelect
        .append('text')
        .attr('class','loc loc2')
        .text(currentStadsdeel);

    stadsdeelSelect
        .append('text')
        .attr('class','loc loc3')
        .text('leefbaarheid ervaren in');
        
    var stadsdeelList = stadsdeelSelect
        .append('g')
        .attr('id','stadsdeel-list')
        .attr('class','loc is-hidden');
    
    stadsdeelList
        .append('rect')
        .attr('class','bgrect')
        .attr('width',500)
        .attr('height',1000)
        .attr('x',-5)
        .attr('y',-30);
    
    
    
    $('.loc2').click(function(){
        $('#stadsdeel-list').toggleClass('is-hidden');
    });



//-----------------------------------//
//               GRAPH               //
//-----------------------------------//
    var graphAdam1 = d3.select('#graphAdam1');
    var graphAdam2 = d3.select('#graphAdam2');
    var graphStad1 = d3.select('#graphStad1');
    var graphStad2 = d3.select('#graphStad2');
    
var w=300, h=300;
var colorscale= d3.scale.ordinal()
  .range(['#7A61F0','#4A90E2']);
//Legend titles
var LegendOptions=['2001', '2015'];
//Data

var d = [
// wanneer je toch procenten wilt om dat dit mooier uitkomt --> /100
    [
    {axis:"Amsterdam",value:6.9},
    {axis:"Centrum",value:7.7},
    {axis:"Nieuw-West",value:6.5},
    {axis:"Noord",value:7.1},
    {axis:"Oost",value:6.7},
    {axis:"West",value:6.4},
    {axis:"Zuid",value:7.6},
    {axis:"Zuidoost",value:6.5},

    ],[
      {axis:"Amsterdam",value:7.5},
      {axis:"Centrum",value:8.1},
      {axis:"Nieuw-West",value:6.7},
      {axis:"Noord",value:7.0},
      {axis:"Oost",value:7.6},
      {axis:"West",value:7.6},
      {axis:"Zuid",value:8.0},
      {axis:"Zuidoost",value:7.2},
  ]
		];



//Options for the Radar chart, other than default
var mycfg = {
  w: w,
  h: h,
  maxValue: 15,
  levels: 3,
  ExtraWidthX: 300
}

//Call function to draw the Radar chart
//Will expect that data is in %'s
RadarChart.draw("#graphAdam2", d, mycfg);
RadarChart.draw("#graphStad2", d, mycfg);

    
    
    
    
    
    $('g.graphtrigger').click(function(){
        if ($('g.is-active').length > 0) {
            $('g.graphtrigger').removeClass('is-active');
        }
        else {
            $('g.graphtrigger').addClass('is-active');            
        }
        
        showGraph();
    });
    
    function showGraph(){
        if ($('g.is-active').length > 0) {
            $('.container__graph').addClass('graph-is-visible');
        }
        else {
            $('.container__graph').removeClass('graph-is-visible');
        };
    };




//-----------------------------------//
//              ZOOMING              //
//-----------------------------------//
    var transValue = [0,0];
    var scaleValue = 1;

    var zoomIn = $('.zoom-in');
    var zoomOut = $('.zoom-out');


    //-----------------//
    //    MOUSE ZOOM   //
    //-----------------//
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 4])
        .on('zoom',function(){
            zoom.center(null);
            mapcontainer.attr('transform','translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
            transValue = d3.event.translate;
            scaleValue = d3.event.scale;

            if (scaleValue >= 3.99999) {
                zoomIn.addClass('is-disabled');
            }
            else {
                zoomIn.removeClass('is-disabled');            
            }

            if (scaleValue <= 1.0001) {
                zoomOut.addClass('is-disabled');
            }
            else {
                zoomOut.removeClass('is-disabled');            
            }

            userGoesTo();
            $('.container__graph').removeClass('graph-is-visible');
            $('g.is-active').removeClass('is-active');
        });

    var zoomsvg = d3.select('#amsterdam');
    zoomsvg
        .call(zoom);

    //-----------------//
    //    CLICK ZOOM   //
    //-----------------//
    d3.selectAll('svg[data-zoom]')
        .on('click', clicked);

    function clicked() {
        mapcontainer.call(zoom.event); // https://github.com/mbostock/d3/issues/2387
        zoom.center([svgSize.width / 2, svgSize.height / 2]);

        // Record the coordinates (in data space) of the center (in screen space).
        var center0 = zoom.center(), translate0 = zoom.translate(), coordinates0 = coordinates(center0);
        zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute('data-zoom')));

        // Translate back to the center.
        var center1 = point(coordinates0);
        zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

        mapcontainer.transition().duration(500).call(zoom.event);
    }

    function coordinates(point) {
        var scale = zoom.scale(), translate = zoom.translate();
        return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
    }

    function point(coordinates) {
        var scale = zoom.scale(), translate = zoom.translate();
        return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
    }

    //-----------------//
    //  STADSDEEL ZOOM //
    //-----------------//
    function userGoesTo(){
        function stadsdeelCheck(xMin,xMax,yMin,yMax,naam){
            if (scaleValue >= 2) {
                if (transValue[0] > (xMin / 5 * scaleValue) && transValue[0] < (xMax / 5 * scaleValue) && transValue[1] > (yMin / 5 * scaleValue) && transValue[1] < (yMax / 5 * scaleValue)) {
                    if (currentStadsdeel != naam) {
                        currentStadsdeel = naam;
                        $('text.loc2').text(currentStadsdeel);
                        $('.adamdash').addClass('is-hidden');
                        $('.staddash').removeClass('is-hidden');
                        loadStadsdeelSelector();
                        loadStadsdeelData();
                    }
                }
                $('g#illustraties').addClass('is-hidden');
            }
            else {
                if (currentStadsdeel != 'Amsterdam') {
                    currentStadsdeel = 'Amsterdam';
                    $('text.loc2').text(currentStadsdeel);
                    $('.staddash').addClass('is-hidden');
                    $('.adamdash').removeClass('is-hidden');
                    loadStadsdeelSelector();
                    loadStadsdeelData();
                }
                $('g#illustraties').removeClass('is-hidden');
            }
        };
        
        showGraphSvg();

        stadsdeelCheck(-1085,95,-458,77,'Westpoort');
        stadsdeelCheck(-475,223,-1485,-340,'Nieuw-West');
        stadsdeelCheck(-1400,-750,-1130,-330,'West');
        stadsdeelCheck(-1800,-1400,-1170,-610,'Centrum');
        stadsdeelCheck(-1700,-475,-1750,-1170,'Zuid');
        stadsdeelCheck(-3500,-1425,-630,-10,'Noord');
        stadsdeelCheck(-2500,-1800,-3000,-1170,'Oost');
        stadsdeelCheck(-3150,-2000,-2700,-1875,'Zuidoost');
    };
    
    function showGraphSvg() {
        if (scaleValue >= 2) {
            if (currentStadDashboard == 'stad1') {                    
                $('#graphAdam1').addClass('is-hidden');
                $('#graphAdam2').addClass('is-hidden');
                $('#graphStad1').removeClass('is-hidden');
                $('#graphStad2').addClass('is-hidden');
            }
            else if (currentStadDashboard == 'stad2') {                    
                $('#graphAdam1').addClass('is-hidden');
                $('#graphAdam2').addClass('is-hidden');
                $('#graphStad1').addClass('is-hidden');
                $('#graphStad2').removeClass('is-hidden');
            }
        }
        else {
            if (currentAdamDashboard == 'adam1') {                    
                $('#graphAdam1').removeClass('is-hidden');
                $('#graphAdam2').addClass('is-hidden');
                $('#graphStad1').addClass('is-hidden');
                $('#graphStad2').addClass('is-hidden');
            }
            else if (currentAdamDashboard == 'adam3') {                    
                $('#graphAdam1').addClass('is-hidden');
                $('#graphAdam2').removeClass('is-hidden');
                $('#graphStad1').addClass('is-hidden');
                $('#graphStad2').addClass('is-hidden');
            }            
        }
    };
    showGraphSvg();

    
    
//-----------------------------------//
//             PLOTTING              //
//-----------------------------------//
    
    //-----------------//
    //    STADSDEEL    //
    //-----------------//
    loadStadsdeelSelector();
    loadStadsdeelData();
    
    function loadStadsdeelSelector() {
        stadsdeelList.selectAll('text').remove();
        
        var stadsdeelnamenfilter = stadsdeeldata.filter(function(d){
            return d.stadsdeel != currentStadsdeel;
        });

        var stadsdeelListplot = stadsdeelList.selectAll('text')
            .data(stadsdeelnamenfilter)
            .enter()
            .append('text')
            .attr('class',function(d){
                return 'stadsdeel-select__stadsdeel ' + d.stadsdeel;
            })
            .attr('transform',function(d,i){
                return 'translate(0,' +  40 * i + ')'
            })
            .text(function(d){
                return d.stadsdeel;
            });
    
        $('.stadsdeel-select__stadsdeel').click(function(){
            var target = $(this)[0].textContent;
            
            zoomTo(target);
        });
    }

var graphAdam1bevolking = d3.select("#graphAdam1").append("svg")
    .attr("width", widthStad1 + marginStad1.left + marginStad1.right)
    .attr("height", heightStad1 + marginStad1.top + marginStad1.bottom)
    .append("g")
    .attr("transform", "translate(" + marginStad1.left + "," + marginStad1.top + ")");
    
    var bevolkingStadsdeelGraphadam1 = bevolkingsdata.filter(function(d){
        return d.stadsdeel == 'Amsterdam';
    });
    
    var bevolkingsdatagraphadam1 = new Array();
    bevolkingsdatagraphadam1[0] = new Array();
    bevolkingsdatagraphadam1[1] = new Array();
    bevolkingsdatagraphadam1[2] = new Array();
    bevolkingsdatagraphadam1[3] = new Array();
    
    bevolkingsdatagraphadam1[0].jaar = new Date('2013');
    bevolkingsdatagraphadam1[0].aantal = bevolkingStadsdeelGraphadam1[0].jaartallen[0]['2013'];
    
    bevolkingsdatagraphadam1[1].jaar = new Date('2014');
    bevolkingsdatagraphadam1[1].aantal = bevolkingStadsdeelGraphadam1[0].jaartallen[0]['2014'];
    
    bevolkingsdatagraphadam1[2].jaar = new Date('2015');
    bevolkingsdatagraphadam1[2].aantal = bevolkingStadsdeelGraphadam1[0].jaartallen[0]['2015'];
    
    bevolkingsdatagraphadam1[3].jaar = new Date('2016');
    bevolkingsdatagraphadam1[3].aantal = bevolkingStadsdeelGraphadam1[0].jaartallen[0]['2016'];
    
    var bevolkingsdataArrayadam1 = new Array();
    bevolkingsdatagraphadam1.forEach(function(d){
        bevolkingsdataArrayadam1.push(+d.aantal);
    });
    
    var xScaleadam1 = d3.time.scale()
        .domain([new Date('2012'),new Date('2016')])
        .range([0, widthStad1]);

    var yScaleadam1 = d3.scale.linear()
        .domain([d3.min(bevolkingsdataArrayadam1),d3.max(bevolkingsdataArrayadam1)])
        .range([heightStad1, 0])
        .nice();

    var xAxisadam1 = d3.svg.axis()
        .scale(xScaleadam1)
        .orient("bottom")
        .ticks(d3.time.years, 1)
        .tickFormat(d3.time.format("%Y"));

    var yAxisadam1 = d3.svg.axis()
        .scale(yScaleadam1)
        .orient("left")
    
    var line1adam1 = d3.svg.line()
        .x(function(d){
            return xScaleadam1(d.jaar);
        })
        .y(function(d){
            return yScaleadam1(d.aantal);
        });
    
    graphAdam1bevolking.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightStad1 + ")")
        .call(xAxisadam1);
    
    graphAdam1bevolking.append("g")
        .attr("class", "y axis")
        .call(yAxisadam1);
    
    graphAdam1bevolking.append("path")
        .datum(bevolkingsdatagraphadam1)
        .attr("class", "line")
        .attr("d", line1adam1);
    
    var graphadam1circle = graphAdam1bevolking.selectAll('circle')
            .data(bevolkingsdatagraphadam1)
            .enter()
            .append('circle')
            .attr('class','graphlinecircle')
            .attr('r',5)
            .attr('cx', function(d) {
                return xScaleadam1(d.jaar);
            })
            .attr('cy', function(d) {
                return yScaleadam1(d.aantal);
            })
        .on('mouseover',tipgraph.show)
        .on('mouseout',tipgraph.hide);
    
    var graphAdam2bevolking = d3.select("#graphAdam1").append("svg")
    .attr("width", widthStad1 + marginStad1.left + marginStad1.right)
    .attr("height", heightStad1 + marginStad1.top + marginStad1.bottom)
    .append("g")
    .attr("transform", "translate(" + marginStad1.left + "," + marginStad1.top + ")");
    
    var bevolkingStadsdeelGraphadam2 = overnachtingsdata
    
    console.log(bevolkingStadsdeelGraphadam2);
    
    var bevolkingsdatagraphadam2 = new Array();
    bevolkingsdatagraphadam2[0] = new Array();
    bevolkingsdatagraphadam2[1] = new Array();
    bevolkingsdatagraphadam2[2] = new Array();
    
    bevolkingsdatagraphadam2[0].jaar = new Date('2013');
    bevolkingsdatagraphadam2[0].overnachtingen = overnachtingsdata[0].overnachtingen;
    
    bevolkingsdatagraphadam2[1].jaar = new Date('2014');
    bevolkingsdatagraphadam2[1].overnachtingen = overnachtingsdata[1].overnachtingen;
    
    bevolkingsdatagraphadam2[2].jaar = new Date('2015');
    bevolkingsdatagraphadam2[2].overnachtingen = overnachtingsdata[2].overnachtingen;
    
    var xScaleadam2 = d3.time.scale()
        .domain([new Date('2012'),new Date('2016')])
        .range([0, widthStad1]);

    var yScaleadam2 = d3.scale.linear()
        .domain([6024000,6826000])
        .range([heightStad1, 0])
        .nice();

    var xAxisadam2 = d3.svg.axis()
        .scale(xScaleadam2)
        .orient("bottom")
        .ticks(d3.time.years, 1)
        .tickFormat(d3.time.format("%Y"));

    var yAxisadam2 = d3.svg.axis()
        .scale(yScaleadam2)
        .orient("left")
    
    var line1adam2 = d3.svg.line()
        .x(function(d){
            return xScaleadam2(d.jaar);
        })
        .y(function(d){
            return yScaleadam2(d.overnachtingen);
        });
    
    graphAdam2bevolking.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightStad1 + ")")
        .call(xAxisadam2);
    
    graphAdam2bevolking.append("g")
        .attr("class", "y axis")
        .call(yAxisadam2);
    
    graphAdam2bevolking.append("path")
        .datum(bevolkingsdatagraphadam2)
        .attr("class", "line")
        .attr("d", line1adam2);
    
    var graphadam2circle = graphAdam2bevolking.selectAll('circle')
            .data(bevolkingsdatagraphadam2)
            .enter()
            .append('circle')
            .attr('class','graphlinecircle')
            .attr('r',5)
            .attr('cx', function(d) {
                return xScaleadam2(d.jaar);
            })
            .attr('cy', function(d) {
                return yScaleadam2(d.overnachtingen);
            })
        .on('mouseover',tipgraph2.show)
        .on('mouseout',tipgraph2.hide);
        
        d3.selectAll("#graphAdam1 .y .tick line")
    .attr("x2", 300);
    
    function loadStadsdeelData() {
        var bevolkingStadsdeel = bevolkingsdata.filter(function(d){
            return d.stadsdeel == currentStadsdeel;
        });
        
        var bevolkingAantal = bevolkingStadsdeel[0].jaartallen[0]['2016'];
        
        var calc = calcData.filter(function(d){
            return d.stadsdeel == currentStadsdeel;
        });
        
        var bevolkingKm2Aantal = calc[0]['bewonerskm2'];
        var hotelKm2Aantal = calc[0]['hotelskm2'];
        
        var cijfer = calc[0]['cijfer'];
        
        if (isNaN(cijfer)) {
            cijfer = 'Geen data';
            $('#bars__oordeelStad').addClass('is-hidden');
            $('#oordeelStad').addClass('no-pointer');
        }
        else {            
            $('#bars__oordeelStad').removeClass('is-hidden');
            $('#oordeelStad').removeClass('no-pointer');
        };
        
        d3.select('.bewonersStad1').text(bevolkingAantal);
        d3.select('.bewonersStadkm21').text(bevolkingKm2Aantal);
        d3.select('.hotelsStadkm21').text(hotelKm2Aantal);
        d3.select('.oordeelStad1').text(cijfer);
        
        d3.select('#graphStad1 svg').remove();

var graphStad1 = d3.select("#graphStad1").append("svg")
    .attr("width", widthStad1 + marginStad1.left + marginStad1.right)
    .attr("height", heightStad1 + marginStad1.top + marginStad1.bottom)
    .append("g")
    .attr("transform", "translate(" + marginStad1.left + "," + marginStad1.top + ")");
        
        var bevolkingStadsdeelGraph = bevolkingsdata.filter(function(d){
        return d.stadsdeel == currentStadsdeel;
    });
    
    var bevolkingsdatagraph = new Array();
    bevolkingsdatagraph[0] = new Array();
    bevolkingsdatagraph[1] = new Array();
    bevolkingsdatagraph[2] = new Array();
    bevolkingsdatagraph[3] = new Array();
    
    bevolkingsdatagraph[0].jaar = new Date('2013');
    bevolkingsdatagraph[0].aantal = bevolkingStadsdeelGraph[0].jaartallen[0]['2013'];
    
    bevolkingsdatagraph[1].jaar = new Date('2014');
    bevolkingsdatagraph[1].aantal = bevolkingStadsdeelGraph[0].jaartallen[0]['2014'];
    
    bevolkingsdatagraph[2].jaar = new Date('2015');
    bevolkingsdatagraph[2].aantal = bevolkingStadsdeelGraph[0].jaartallen[0]['2015'];
    
    bevolkingsdatagraph[3].jaar = new Date('2016');
    bevolkingsdatagraph[3].aantal = bevolkingStadsdeelGraph[0].jaartallen[0]['2016'];
    
    var bevolkingsdataArray = new Array();
    bevolkingsdatagraph.forEach(function(d){
        bevolkingsdataArray.push(+d.aantal);
    });
    
    var xScaleStad = d3.time.scale()
        .domain([new Date('2012'),new Date('2016')])
        .range([0, widthStad1]);

    var yScaleStad = d3.scale.linear()
        .domain([d3.min(bevolkingsdataArray),d3.max(bevolkingsdataArray)])
        .range([heightStad1, 0])
        .nice();

    var xAxisStad = d3.svg.axis()
        .scale(xScaleStad)
        .orient("bottom")
        .ticks(d3.time.years, 1)
        .tickFormat(d3.time.format("%Y"));

    var yAxisStad = d3.svg.axis()
        .scale(yScaleStad)
        .orient("left")
    
    var line1Stad = d3.svg.line()
        .x(function(d){
            return xScaleStad(d.jaar);
        })
        .y(function(d){
            return yScaleStad(d.aantal);
        });
    
    graphStad1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightStad1 + ")")
        .call(xAxisStad);
    
    graphStad1.append("g")
        .attr("class", "y axis")
        .call(yAxisStad);
    
    graphStad1.append("path")
        .datum(bevolkingsdatagraph)
        .attr("class", "line")
        .attr("d", line1Stad);
    
    var graphStad1circle = graphStad1.selectAll('circle')
            .data(bevolkingsdatagraph)
            .enter()
            .append('circle')
            .attr('class','graphlinecircle')
            .attr('r',5)
            .attr('cx', function(d) {
                return xScaleStad(d.jaar);
            })
            .attr('cy', function(d) {
                return yScaleStad(d.aantal);
            })
        .on('mouseover',tipgraph.show)
        .on('mouseout',tipgraph.hide);
        
        d3.selectAll("#graphStad1 .y .tick line")
    .attr("x2", 300);
    };
    
    function zoomTo(stadsdeel) {
        var stadsdelenzoomdata = stadsdeeldata.filter(function(d){
            return d.stadsdeel == stadsdeel;
        });
        
        var zoomToScale = +stadsdelenzoomdata[0].scale;
        var zoomToTranslateX = +stadsdelenzoomdata[0].translateX;
        var zoomToTranslateY = +stadsdelenzoomdata[0].translateY;
        
        mapcontainer.call(zoom.event);
        zoom.scale(zoomToScale);
        zoom.translate([zoomToTranslateX,zoomToTranslateY]);
        mapcontainer.transition().duration(750).call(zoom.event);
        $('#stadsdeel-list').toggleClass('is-hidden');
    };


    //-----------------//
    //      FILTER     //
    //-----------------//
    var filter = d3.select('#filter');
    
    filter
        .append('text')
        .attr('class','selectlaag')
        .text('Selecteer een laag');
    
    var openclose = filter
        .append('g')
        .attr('class','openclose');
    
    openclose
        .append('rect')
        .attr('class','bgrect do-filterBG')
        .attr('width',14)
        .attr('height',14);
    
    openclose
        .append('path')
        .attr('class','do-filterclose')
        .attr('d','M34.575,32.009L63.364,3.457c0.793-0.787,0.793-2.062,0-2.849c-0.794-0.786-2.079-0.786-2.873,0	l-28.56,28.327L3.351,0.59C2.955,0.195,2.434,0,1.916,0C1.395,0,0.875,0.195,0.48,0.59c-0.794,0.787-0.794,2.062,0,2.849	l28.788,28.553L0.479,60.543c-0.793,0.787-0.793,2.062,0,2.849c0.794,0.786,2.079,0.786,2.873,0l28.56-28.327l28.58,28.346	c0.396,0.395,0.917,0.59,1.436,0.59c0.521,0,1.04-0.195,1.436-0.59c0.794-0.787,0.794-2.062,0-2.849L34.575,32.009z');
    
    openclose
        .append('path')
        .attr('class','do-filteropen')
        .attr('d','M3.352,63.392l28.56-28.327l28.58,28.346c0.396,0.395,0.917,0.59,1.436,0.59c0.521,0,1.04-0.195,1.436-0.59		c0.794-0.787,0.794-2.062,0-2.849L33.384,30.827c-0.2-0.2-0.493-0.375-0.757-0.475c-0.75-0.282-1.597-0.107-2.166,0.456		L0.479,60.543c-0.793,0.787-0.793,2.062,0,2.849C1.273,64.178,2.558,64.178,3.352,63.392z');
    
    $('[class^="do-filter"]').click(function(){
        $('#filter').toggleClass('is-closed');
    });
    
    $('.do-filterBG').click(function(){
        $('#filter').toggleClass('is-closed');
    });
    
    var filterplot = filter.selectAll('.filter')
        .data(filternamen)
        .enter()
        .append('g')
        .attr('class',function(d){
            return 'filter filter' + d.filterop.replace(/\s+/g, '').toLowerCase();
        })
        .attr('transform',function(d,i){
            return 'translate(60,' + (65 + 30 * i) + ')'
        });
    
    filterplot
        .append('circle')
        .attr('r',10);
    
    filterplot
        .append('text')
        .text(function(d){
            return d.filterop;
    });
    
    
    //The filtering
    $('.filter').click(function(){
        var clickTarget = $(this);
        clickTarget.toggleClass('is-disabled');
        var target = clickTarget[0].classList[1].replace(/filter/,'');
        $('#amsterdam #' + target).toggleClass('is-hidden');
    })
    
    
    //-----------------//
    //      AIRBNB     //
    //-----------------//
    var airbnb = mapcontainer
        .append('g')
        .attr('id','airbnb');  
    
    var airbnbplot = airbnb.selectAll('g')
        .data(airbnbdata);

    airbnbplot.enter()
        .append('g')
        .attr('class', 'airbnb')
        .append('circle')
        .attr('class','dot')
        .attr('cx', function(d) {
            return xScale(d.long);
    })
        .attr('cy', function(d) {
            return yScale(d.lat);
    })
        .attr('r', 1)
        .call(function(d,i){
        setTimeout(function(){
            $('#splashscreen').remove();
        }, 10000);
        });
    
    
    //-----------------//
    //      MUSEA      //
    //-----------------//
    var attractiemuseum = mapcontainer
        .append('g')
        .attr('id','toeristischeattracties');
    
    var museaBezoekers = new Array;
    museadata.forEach(function(d){
        museaBezoekers.push(+d.bezoekers);
    });

    var circleSize = d3.scale.linear()
        .domain([d3.min(museaBezoekers),d3.max(museaBezoekers)])
        .range([1,5]);
    
    var museaplot = attractiemuseum.selectAll('g')
        .data(museadata);

    museaplot.enter()
        .append('g')
        .attr('class', function(d) {
            return d.naam + ' attractie_museum';
    })
        .append('circle')
        .attr('class','dot')
        .attr('cx', function(d) {
            return xScale(d.long);
    })
        .attr('cy', function(d) {
            return yScale(d.lat);
    })
        .attr('r', function(d) {
            return circleSize(d.bezoekers);
    })
        .on('mouseover',tip.show)
        .on('mouseout',tip.hide);
    
    
    //-----------------//
    //      HOTELS     //
    //-----------------//
    var hotels = mapcontainer
        .append('g')
        .attr('id','hotels');  
    
    var hotelsplot = hotels.selectAll('g')
        .data(hotelsdata);

    hotelsplot.enter()
        .append('g')
        .attr('class', function(d) {
            return d.naam + ' hotel';
    })
        .append('circle')
        .attr('class','dot')
        .attr('cx', function(d) {
            return xScale(d.long);
    })
        .attr('cy', function(d) {
            return yScale(d.lat);
    })
        .attr('r', 1);
    

//    function cleanGraphData(){
//            var bevolkingsdatagraph = new Array();
//            bevolkingsdatagraph[0] = new Array();
//            bevolkingsdatagraph[1] = new Array();
//            bevolkingsdatagraph[2] = new Array();
//            bevolkingsdatagraph[3] = new Array();
//
//            bevolkingsdatagraph[0].jaar = 2013;
//            bevolkingsdatagraph[0].aantal = bevolkingStadsdeel[0].jaartallen[0]['2013'];
//
//            bevolkingsdatagraph[1].jaar = 2014;
//            bevolkingsdatagraph[1].aantal = bevolkingStadsdeel[0].jaartallen[0]['2014'];
//
//            bevolkingsdatagraph[2].jaar = 2015;
//            bevolkingsdatagraph[2].aantal = bevolkingStadsdeel[0].jaartallen[0]['2015'];
//
//            bevolkingsdatagraph[3].jaar = 2016;
//            bevolkingsdatagraph[3].aantal = bevolkingStadsdeel[0].jaartallen[0]['2016'];
//    }

//Scroll detection
var wheelDistance = function(evt){
    if (!evt) evt = event;
    var w=evt.wheelDelta, d=evt.detail;
    if (d){
        if (w) return w/d/40*d>0?1:-1; // Opera
        else return -d/3;              // Firefox;         TODO: do not /3 for OS X
    } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
};
var wheelDirection = function(evt){
    if (!evt) evt = event;
    return (evt.detail<0) ? 1 : (evt.wheelDelta>0) ? 1 : -1;
};
var test = document.querySelector('.container__dashboard');
function showResults(evt){
    var distance  = wheelDistance(evt);
    var direction = wheelDirection(evt);
    
    if (currentStadsdeel == 'Amsterdam') {
        if ($('g.is-active').length > 0) {
            $('g.is-active').removeClass('is-active');
            $('.container__graph').removeClass('graph-is-visible');
        }
        else if (currentAdamDashboard == 'adam1' && direction == -1) {
            $('#adam1').addClass('hide-dashboard');
            $('#adam2').removeClass('hide-dashboard1');
            currentAdamDashboard = 'adam2';
        }
        else if (currentAdamDashboard == 'adam2' && direction == -1) {
            $('#adam2').addClass('hide-dashboard2');
            $('#adam3').removeClass('hide-dashboard');
            currentAdamDashboard = 'adam3';
        }
        else if (currentAdamDashboard == 'adam2' && direction == 1) {
            $('#adam2').addClass('hide-dashboard1');
            $('#adam1').removeClass('hide-dashboard');
            currentAdamDashboard = 'adam1';
        }
        else if (currentAdamDashboard == 'adam3' && direction == 1) {
            $('#adam3').addClass('hide-dashboard');
            $('#adam2').removeClass('hide-dashboard2');
            currentAdamDashboard = 'adam2';
        }
        showGraphSvg();
    }
    else {
        if ($('g.is-active').length > 0) {
            $('g.is-active').removeClass('is-active');
            $('.container__graph').removeClass('graph-is-visible');
        }
        else if (currentStadDashboard == 'stad1' && direction == -1) {
            $('#stad1').addClass('hide-dashboard');
            $('#stad2').removeClass('hide-dashboard');
            currentStadDashboard = 'stad2';
        }
        else if (currentStadDashboard == 'stad2' && direction == 1) {
            $('#stad2').addClass('hide-dashboard');
            $('#stad1').removeClass('hide-dashboard');
            currentStadDashboard = 'stad1';
        }
        showGraphSvg();
    }
        
}

if (test.addEventListener){
    test.addEventListener( 'mousewheel', showResults, false );     // Chrome/Safari/Opera
    test.addEventListener( 'DOMMouseScroll', showResults, false ); // Firefox
}else if (test.attachEvent){
    test.attachEvent('onmousewheel',showResults);                  // IE
}

};

$('.closegraph').click(function(){
    $('g.is-active').removeClass('is-active');
    $('.container__graph').removeClass('graph-is-visible');
});