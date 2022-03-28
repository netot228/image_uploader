// sizesCollect
let imageSizes = [
    // [2000, 2000],
    // [1200,800],
    // [900,600,true], // fit size - questionable moment
    // [900,600],
    // [600,400],
    // [300,200],
    // [600,600],
    // [400,400],
    // [200,200],
    [100,100],
]

let limitAcceptedFiles = 1;
let fileSizeLimit = 5*Math.pow(1024,2); // limit is 5mb
let imgQuality = 0.8;

let dropArea = document.getElementById('drup_area');
let addFileBtn = dropArea.querySelector('.s_file_input_btn');
let fileInput = document.getElementById('_id_file_input');
let resultArea = document.getElementById('result_area');

let rowTmpl = document.getElementById('_id_result_image_row_tmpl');

function handlerItems(items,limit,fileIncome){

    console.log(fileIncome ? 'dataTransfer.files' : 'dataTransfer.items');

    let files = [];

    for(let i=0; i<limit; i++){

        if(!items[i]) break;

        let item = items[i];
        let isFile = fileIncome ? true : item.kind=='file' ? true : false;

        if(isFile && item.type.match('image/(apng|avif|gif|jpeg|png|svg|webp)')){

            let file = fileIncome ? item : item.getAsFile();

            if(file.size>fileSizeLimit){
                alert('You are trying to upload a file that is too large');
                break;
            }

            files.push(file);

        } else {

            alert('not acceptable type of file');
            console.log('not acceptable type of file');
            console.dir(item);
            continue;

        }

    }

    prepareFiles(files);
}

function prepareFiles(files){
    if(Array.isArray(files)){

        resultArea.innerHTML = '';

        for(let i=0; i<files.length; i++){
            let imageObj        = {};
            let image           = files[i];
            let uploadImageRow  = rowTmpl.content.firstElementChild.cloneNode(true);
            let imagePlace      = uploadImageRow.querySelector('.item-image');
            let imageInfo       = uploadImageRow.querySelector('.item-info');

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
                                        <p>size: ${baseImgWidth} x ${baseImgHeight} – ${fileSize}kB
                                        <p>type: ${image.type}
                                        `;

                imagePlace.append(baseImg);


                imageObj = {
                    'name': image.name,
                    'size': fileSize,
                    'type': image.type,
                    'width': baseImgWidth,
                    'height': baseImgHeight,
                    'blob': image,
                    'imageSizes': []
                };

                // generate sizes
                for(let i=0;i<imageSizes.length;i++){

                    let imageRow = rowTmpl.content.firstElementChild.cloneNode(true);
                        imageRow.classList.add('m_loading');
                    let imagePlace = imageRow.querySelector('.item-image');
                    let imageInfo   = imageRow.querySelector('.item-info');

                    resultArea.append(imageRow);

                    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                    let dWidth = imageSizes[i][0]; // destination Width
                    let dHeight = imageSizes[i][1]; // destination Height
                    let dX = 0;
                    let dY = 0;
                    let sWidth, sHeight, sX, sY;

                    if(imgOrientaion=='landscape'){
                        // if image width more than destination width
                        if(dHeight*baseImgWidth/baseImgHeight >= dWidth){
                            sWidth = Math.round(baseImgHeight*dWidth/dHeight);
                            sHeight = baseImgHeight;
                            // by default we take central part of image
                            sX = Math.round((baseImgWidth - sWidth)/2);
                            sY = 0;
                        } else {
                            // inscribed size
                        }
                    } else {
                        // the logic of portrait cropping
                    }

                    let cnv     = document.createElement('canvas');
                    cnv.width   = dWidth;
                    cnv.height  = dHeight;
                    let ctx     = cnv.getContext('2d');

                    ctx.drawImage(baseImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

                    // rewrite to promise
                    cnv.toBlob(function(blob){
                        let img = document.createElement('img');
                        img.src = URL.createObjectURL(blob);
                        img.onload = function(){
                            imageRow.classList.remove('m_loading');
                            imagePlace.append(img);
                            imageInfo.innerHTML = `<p>size: ${img.naturalWidth} x ${img.naturalHeight}`;


                            imageObj.imageSizes.push({
                                'name': 'pic_'+dWidth+'x'+dHeight,
                                'width': img.naturalWidth,
                                'height': img.naturalHeight,
                                'blob': blob
                            })


                            if(i==imageSizes.length-1){
                                console.log('possible last iteration')
                                console.dir(imageObj);
                            }
                            // URL.revokeObjectURL(img.src);
                        }
                    }, image.type, imgQuality)

                }

                // URL.revokeObjectURL(baseImg.src);
            }

        }
    }
}

let drugEvents = ['dragenter', 'dragleave', 'dragover', 'drop'];

    // add preventDefault and lighting
    drugEvents.forEach(event=>{
        dropArea.addEventListener(event, e=>{
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

    dropArea.addEventListener('drop', e=>{

        if(e.dataTransfer.items.length>0){

            let dataItems = e.dataTransfer.items;
            let limit = limitAcceptedFiles ? limitAcceptedFiles : dataItems.length;

            handlerItems(dataItems, limit, false);

        } else if(e.dataTransfer.files.length>0) {

            let dataFiles = e.dataTransfer.files
            let limit = limitAcceptedFiles ? limitAcceptedFiles : dataFiles.length;

            handlerItems(dataFiles, limit, true);

        }

    })


    addFileBtn.addEventListener('click', e=>{
        fileInput.click();
    })
    fileInput.addEventListener('change', function(e){
        e.preventDefault();

        let dataFiles = this.files
        let limit = limitAcceptedFiles ? limitAcceptedFiles : dataFiles.length;

        handlerItems(dataFiles, limit, true);
    })
