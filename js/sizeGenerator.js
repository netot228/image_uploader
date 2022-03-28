// temp

// let baseImg = img_original;

let baseImg = document.createElement('img');
baseImg.src = img_original.src;
let imageObj = {};


// sizesCollect
let imageSizes = [
    // [2000, 2000],
    // [1200,800],
    // [900,600,true], // fit size - questionable moment
    // [900,600],
    [600,400],
    // [300,200],
    // [600,600],
    // [400,400],
    [200,200],
    // [100,100],
    // unformat sizes just for tests
    // [500,200],
    // [895,500],
]

console.log('sizeGenerator');


baseImg.onload = function(){
    let baseImgWidth = baseImg.naturalWidth;
    let baseImgHeight = baseImg.naturalHeight;
    let imgOrientaion = baseImgWidth>baseImgHeight ? 'landscape' : 'portrait';

    console.dir(baseImg);

    imageSizes.forEach(item=>{
        let destW = item[0];
        let destH = item[1];
        let destFit = item[2] || null;

        let cnv = document.createElement('canvas');
        let ctx = cnv.getContext('2d');

        cnv.width = destW;
        cnv.height = destH;

        ctx.drawImage(baseImg, 0,0, baseImgWidth, baseImgHeight, 0, 0, destW, destH);

        test_result.append(cnv);
    })

}