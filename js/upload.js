import { cropIt } from "./crop.js";


// sizesCollect
let imageSizes = [
    // [2000, 2000],
    // [1200,800],
    // [900,600,true], // fit size - questionable moment
    // [900,600],
    [600,400],
    // [300,200],
    [600,600],
    // [400,400],
    // [200,200],
    // [100,100],
    // unformat sizes just for tests
    // [500,200],
    // [895,500],
]

let limitAcceptedFiles = false;
let fileSizeLimit = 5*Math.pow(1024,2); // limit is 5mb
let imgQuality = 0.8;

let dropArea = document.getElementById('drup_area');
let addFileBtn = dropArea.querySelector('.s_file_input_btn');
let fileInput = document.getElementById('_id_file_input');
let resultArea = document.getElementById('result_area');

let rowTmpl = document.getElementById('_id_result_image_row_tmpl');
let cropTmpl = document.getElementById('_id_croparea_tmpl');

let imgCollect = [];

function fileIncomeHandler(items,limit,fileIncome){

    // here we prepare files to transfer to cropping

    console.log('fileIncomeHandler');
    console.log(fileIncome ? 'dataTransfer.files' : 'dataTransfer.items');

    let files = [];

    for(let i=0; i<limit; i++){

        if(!items[i]) break;

        let item    = items[i];
        let isFile  = fileIncome ? true : item.kind=='file' ? true : false;
        let file    = fileIncome ? item : item.getAsFile();

        // console.log('iteration: ' + +(i+1));
        // console.dir(file);

        if(isFile){



            if(file.size>fileSizeLimit){
                alert('You are trying to upload a file that is too large! \n limit is: 5Mb');
                continue;
            } else if(!file.type.match('image/(apng|jpeg|png|svg|webp)')){

                alert('not acceptable type of file');

                if(file.type.match('image/(avif|gif)')){
                    // gif upload logic
                    console.log('gif file income');

                } else {
                    console.log('not acceptable type of file');
                }
                console.dir(file);
                continue;
            } else if(file.type.match('image/(apng|jpeg|png|svg|webp)')){

                files.push(file);

            }

        } else {

            // there should be an error handler here

            alert('something went wrong');
        }
    }

    if(files.length>0){
        prepareFiles(files);
    }


}

function prepareFiles(files){

    if(Array.isArray(files)){

        console.log('prepareFiles');

        resultArea.innerHTML = '';

        for(let i=0; i<files.length; i++){

            let imageObj        = {};
            let image           = files[i];
            let uploadImageRow  = rowTmpl.content.firstElementChild.cloneNode(true);
            let imagePlace      = uploadImageRow.querySelector('.b_result_area-item-image');
            let imageInfo       = uploadImageRow.querySelector('.b_result_area-item-info');
            let imageControl    = uploadImageRow.querySelector('.b_result_area-item-control');

            uploadImageRow.id = 'upload_image_'+i;

            resultArea.classList.add('m_show');
            resultArea.append(uploadImageRow);
            uploadImageRow.classList.add('m_loading');

            let baseImg = document.createElement('img');
            baseImg.src = URL.createObjectURL(image);

            baseImg.onload = function(){
                let baseImgWidth = baseImg.naturalWidth;
                let baseImgHeight = baseImg.naturalHeight;
                let imgOrientaion = baseImgWidth>baseImgHeight ? 'landscape' : 'portrait';
                let fileSize = +(image.size/1024).toFixed(2);

                uploadImageRow.classList.remove('m_loading');

                imageInfo.innerHTML = `
                                        <p>name: ${image.name}
                                        <p>size: ${baseImgWidth} x ${baseImgHeight} - ${fileSize}kB
                                        <p>type: ${image.type}
                                        `;

                imagePlace.append(baseImg);

                imageObj = {
                    'name': image.name,
                    'size': fileSize,
                    'type': image.type,
                    'width': baseImgWidth,
                    'height': baseImgHeight,
                    'file': image,
                    'rowId': uploadImageRow.id,
                    'imageSizes': []
                };

                // cropArea

                let cropArea = cropTmpl.content.firstElementChild.cloneNode(true);

                cropArea.querySelectorAll('img').forEach(function(img){
                    img.src = baseImg.src;
                    img.onload = function(){

                        let ratio = img.dataset.ratio;
                        cropIt(img, ratio);

                    }

                });

                // console.dir(imageObj);

                imgCollect.push(imageObj);

                imageControl.append(cropArea);
            }

        }
    }
}

let drugEvents = ['dragenter', 'dragleave', 'dragover', 'drop'];

// add preventDefault and lighting
drugEvents.forEach(function(event){
    dropArea.addEventListener(event, function(e){
        e.preventDefault();

        // add lighting to dropArea
        switch(event){
            case 'dragenter':
            case 'dragover':
                dropArea.classList.add('m_over');
                break;
            case 'dragleave':
            case 'drop':
                dropArea.classList.remove('m_over');
                break;
        }

        e.stopPropagation();
    }, false);
})

dropArea.addEventListener('drop',function(e){

    let dataItems, limit;

    if(e.dataTransfer.items.length>0){

        dataItems = e.dataTransfer.items;
        limit = limitAcceptedFiles ? limitAcceptedFiles : dataItems.length;

    } else if(e.dataTransfer.files.length>0) {

        dataFiles = e.dataTransfer.files
        limit = limitAcceptedFiles ? limitAcceptedFiles : dataFiles.length;

    }

    fileIncomeHandler(dataItems, limit, false);

})


addFileBtn.addEventListener('click', function(e){
    fileInput.click();
})

fileInput.addEventListener('change', function(e){
    e.preventDefault();

    let dataFiles = this.files
    let limit = limitAcceptedFiles ? limitAcceptedFiles : dataFiles.length;

    fileIncomeHandler(dataFiles, limit, true);
})


// temporary
    gobtn.addEventListener('click', ()=>{

        // imgCollect - набор загруженных изображений

        imgCollect.forEach(el=>{
            console.dir(el);

            let imgW = el.width;
            let imgH = el.height;
            let imgO = imgW>imgH ? 'landscape' : 'portrait';

            let croppingData = {};
            let imgRow = document.getElementById(el.rowId);

            let imgSrc = imgRow.querySelector('.b_result_area-item-image img');

            imgRow.querySelectorAll('.b_croparea img').forEach(img=>{
                let ratio = img.dataset.ratio.split(':');
                ratio = ratio[0]>ratio[1] ? 'landscape' :
                        ratio[0]==ratio[1] ? 'square' : 'portrait';
                let cropping = img.dataset.croppingData || null;

                if(cropping) {
                    cropping = cropping.split(';');
                    croppingData[ratio] = cropping;
                }

            })

            console.dir(croppingData);

            imageSizes.forEach(item=>{

                // требуемые параметры для конечного изображения
                let destW   = item[0];
                let destH   = item[1];
                let destFit = item[2] || null;
                let destO   = destW>destH  ? 'landscape' :
                              destW==destH ? 'square'    : 'portrait';

                // let destW = imgW<item[0] ? imgW : item[0];
                // let destH = imgH<item[1] ? imgH : item[1];
                // let destFit = item[2] || null;
                

                let cnv = document.createElement('canvas');
                let ctx = cnv.getContext('2d');

                

                // выставляем координаты как будем кропать изображение
                let sX = imgW<item[0] ? 0 : croppingData[destO][0]*imgW/100;
                let sW = imgW<item[0] ? imgW : croppingData[destO][2]*imgW/100;

                // let sY = imgH<item[1] ? 0 : croppingData[destO][1]*imgH/100;
                // let sH = imgH<item[1] ? imgH : croppingData[destO][3]*imgH/100;
                let sY;
                let sH;
                if(imgH<item[1]){
                    sY = 0;
                    sH = imgH;
                } 
                // если изображение вертикальное или квадратное 
                // и его ширина меньше того, что требуется на выходе
                // корректируем кроп
                else if(imgW<destW && (imgO == 'portrait' || imgO == 'square')){
                    let k = destW/imgW;
                    sY = (croppingData[destO][1]*imgH/100)/k;
                    sH = (croppingData[destO][3]*imgH/100)*k;
                } else {
                    sY = croppingData[destO][1]*imgH/100;
                    sH = croppingData[destO][3]*imgH/100;
                }
                
                


                
                


                
                // выставляем размеры канваса по размеру выходного файла
                cnv.width = imgW<item[0] ? imgW : destW;
                cnv.height = imgH<item[1] ? imgH : destH;

                ctx.drawImage(imgSrc, sX,sY, sW, sH, 0, 0, cnv.width, cnv.height);

                test_result.append(cnv);
            })


        })
    })