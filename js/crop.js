
export function cropIt(img, ratio){
    /*
        await:
        img - imgDomElement
        ratio - string like '3:2', '1:1', '16:9'

        return:
        sX, sY, destW, destH - percent from original image;

        // need styles for cropping tools
    */



    if(img instanceof HTMLImageElement){

        let cropArea = document.createElement('div');
            cropArea.className = 's_croppingarea';

        let clip = document.createElement('div');
            clip.className = 'clip';
            clip.style.backgroundImage = 'url('+img.src+')';

        // create control points
        let point1 = document.createElement('div');
            point1.className = 'dot point1';
        let point2 = document.createElement('div');
            point2.className = 'dot point2';
        let point3 = document.createElement('div');
            point3.className = 'dot point3';
        let point4 = document.createElement('div');
            point4.className = 'dot point4';

        let wrapper = document.createElement('div');
            wrapper.className = 'wrapper';

            wrapper.append(point1, point2, point3, point4);

        img.after(cropArea);

        // debugger;

        // img.remove();
        cropArea.append(img, wrapper, clip);

        let iW = img.naturalWidth;
        let iH = img.naturalHeight;
        let rW = ratio.split(':')[0];
        let rH = ratio.split(':')[1];


        // comression coefficient
        let k = img.clientWidth/iW;

        let destWidth = (rW*iH/rH)*k;
        destWidth = img.clientWidth<destWidth ? img.clientWidth : destWidth;

        let destHeight = destWidth*rH/rW;

        let sX = (iW*k - destWidth)/2;
        let sY = (iH*k - destHeight)/2;

        // starting position
        let originW = destWidth;
        let originH = destHeight;
        let originX = sX;
        let originY = sY;

        // output obj
        let outVal = {};


        function cropMoving(x,y,w,h){

            // sX = sX;
            // sY = sY;
            // destWidth = destWidth;
            // destHeight = destHeight;

            // console.log(`${sX},${sY},${destWidth},${destHeight}`);

            let clipParams = `${x}px ${y}px, ${x+w}px ${y}px, ${x+w}px ${y+h}px, ${x}px ${y+h}px`;
                clip.style.clipPath = 'polygon('+clipParams+')';

            wrapper.style.top = y + 'px';
            wrapper.style.left = x + 'px';
            wrapper.style.width = w + 'px';
            wrapper.style.height = h + 'px';

            // return sX,sY,destWidth,destHeight;


            let prcntX,prcntY,prcntW,prcntH;
                prcntX = (x / img.clientWidth)*100;
                prcntY = (y / img.clientHeight)*100;

                // recalculate width and height percentage
                prcntW = (w / img.clientWidth)*100;
                prcntH = (h / img.clientHeight)*100;

                img.dataset.croppingData = `${prcntX};${prcntY};${prcntW};${prcntH}`;
        }

        cropMoving(sX,sY,destWidth,destHeight);

        let x,y, tmpX, tmpY, tmpW, tmpH, controlEL;

        function moveHandler(e){

            // destWidth changing for all points, not for moving

            if(controlEL==wrapper){ // move crop area only !noscale
                // sX changing only for point1, point4, move

                if(sX + (e.clientX - x) < 0){
                    tmpX = 0;
                } else if(sX + (e.clientX - x) + destWidth > img.clientWidth){
                    tmpX = img.clientWidth - destWidth;
                } else {
                    tmpX = sX + (e.clientX - x);
                }


                // sY changing only for point1, point2, move
                if(sY + (e.screenY - y) < 0){
                    tmpY = 0;
                } else if(sY + (e.screenY - y) + destHeight > img.clientHeight){
                    tmpY = img.clientHeight - destHeight;
                } else {
                    tmpY = sY + (e.screenY - y);
                }
                tmpW = destWidth;
                tmpH = destHeight


                console.log(tmpX,tmpY,tmpW,tmpH);

            } else {
                // scale croparea

                if(controlEL == point1){

                    tmpX = sX - (x-e.clientX) < 0 ? 0 : sX - (x-e.clientX);
                    tmpY = sY - (x-e.clientX)*rH/rW < 0 ? 0 : sY - (x-e.clientX)*rH/rW;

                    if(destWidth - (e.clientX-x) > img.clientWidth - tmpX){
                        tmpW = img.clientWidth - tmpX;
                    } else {
                        if((destWidth - (e.clientX-x))*rH/rW<=originH){
                            tmpW = destWidth - (e.clientX-x);
                        } else {
                            tmpW = originW;
                        }
                    }

                    tmpH = tmpW*rH/rW;

                } else if(controlEL == point2){

                    // sX stay width,height,y changing

                    tmpX = sX;
                    tmpY = sY - (y-e.clientY) < 0 ? 0 : sY - (y-e.clientY);

                    if(destHeight - (e.clientY-y) > img.clientHeight - tmpY){
                        tmpH = img.clientHeight - tmpY;
                    } else {
                        tmpH = destHeight - (e.clientY-y);
                    }

                    if(tmpH*rW/rH>img.clientWidth - tmpX){
                        tmpH = (img.clientWidth - tmpX)*rH/rW;
                        tmpW = img.clientWidth - tmpX;
                    } else {
                        tmpW = tmpH*rW/rH;
                    }


                } else if(controlEL === point3){

                    // width & height changing

                    tmpX = sX;
                    tmpY = sY;

                    tmpW = destWidth - (x-e.clientX);

                    if(tmpW+tmpX>img.clientWidth){
                        tmpW = img.clientWidth-tmpX;
                    }

                    if(tmpW*rH/rW > img.clientHeight - tmpY){
                        tmpH = img.clientHeight - tmpY;
                        tmpW = tmpH*rW/rH;
                    } else {
                        tmpH = tmpW*rH/rW;
                    }


                } else if(controlEL === point4) {

                    // sY stay width,height,x - changing

                    tmpX = sX - (x-e.clientX);
                    if(tmpX<0){
                        tmpX = 0;
                    }
                    tmpY = sY;

                    tmpW = destWidth - (e.clientX-x);
                    if(tmpW>img.clientWidth){
                        tmpW = img.clientWidth;
                    }

                    if(tmpW*rH/rW > img.clientHeight - tmpY){
                        tmpH = img.clientHeight - tmpY;
                        tmpW = tmpH*rW/rH;
                    } else {
                        tmpH = tmpW*rH/rW;
                    }

                }
            }

            cropMoving(tmpX,tmpY,tmpW,tmpH);
        }

        [point1, point2, point3, point4].forEach(function(corner){
            corner.addEventListener('mousedown', function(e){
                e.preventDefault();

                // x = 0;
                // y = 0;
                x = e.clientX;
                y = e.clientY;

                controlEL = this;
                cropArea.addEventListener('mousemove', moveHandler);

            })
        })

        wrapper.addEventListener('mousedown', function(e){
            e.preventDefault();
            if(e.target !== this) return;

            x = e.clientX;
            y = e.screenY;

            controlEL = this;

            cropArea.addEventListener('mousemove', moveHandler)
        })

        wrapper.addEventListener('dblclick', function(e){
            sX = originX;
            sY = originY;
            destWidth = originW;
            destHeight = originH;
            cropMoving(originX,originY,originW,originH);
        })

        document.addEventListener('mouseup', function(e){
            controlEL = null;
            sX = tmpX ? tmpX : sX;
            sY = tmpY ? tmpY : sY;
            destWidth = tmpW ? tmpW : destWidth;
            destHeight = tmpH ? tmpH : destHeight;
            cropArea.removeEventListener('mousemove', moveHandler);
        })

    }

}
