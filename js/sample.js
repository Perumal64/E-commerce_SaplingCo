// Demo catalogue shown when Firebase isn't connected / has no data yet (read-only).
(()=>{const cs=[["🪴","Indoor Plants"],["🌵","Succulents & Cacti"],["🏺","Planters & Pots"],["🌱","Seeds & Bulbs"],["✂️","Garden Tools"],["🧪","Soil & Plant Care"]];
const P=[[0,"Monstera Deliciosa","Split-leaf statement plant for bright, indirect light",24,899],[0,"Snake Plant","Nearly unkillable air-purifying classic",40,449],[0,"Golden Pothos","Trailing vine, thrives in low light",120,199],[0,"Peace Lily","Glossy leaves and white blooms",12,549],[0,"ZZ Plant","Drought-proof and glossy",9,799],
[1,"Echeveria Rosette","Pastel rosette succulent",150,129],[1,"Zebra Haworthia","Tiny striped succulent for desks",85,149],[1,"Jade Plant","The good-luck succulent",30,299],[1,"Bunny Ear Cactus","Soft pads, sharp personality",22,249],
[2,"Terracotta Pot 6in","Breathable classic with drainage hole",200,99],[2,"Speckle Ceramic Planter","Matte glaze, saucer included",35,349],[2,"Macramé Hanger","Cotton rope hanging planter",48,279],[2,"Self-watering Pot","2-day water reservoir",14,399],
[3,"Basil Seed Pack","Sweet basil, 100 seeds",300,49],[3,"Marigold Seeds","Bright orange blooms, 50 seeds",250,39],[3,"Lily Bulbs (5)","Oriental lily, fragrant",10,249],
[4,"Pruning Shears","Stainless bypass blades",26,429],[4,"Hand Trowel","Ergonomic grip",40,199],[4,"Mist Spray Bottle","500 ml fine mist",75,149],
[5,"Coco Peat Block 5kg","Expands to 25 L",90,179],[5,"Vermicompost 2kg","Rich organic fertiliser",130,129],[5,"Neem Oil Spray","Natural pest control",17,249],[5,"Cactus Mix 1kg","Fast-draining potting mix",8,159]];
window.SAMPLE={cats:cs.map((c,i)=>({id:"c"+i,icon:c[0],name:c[1],active:true})),items:P.map((p,i)=>({id:"d"+i,catId:"c"+p[0],title:p[1],des:p[2],qty:p[3],price:p[4],active:true}))}})();
