/* Audrey Closet v13.23.6.3 — normalize transparent photo uploads */
(function(){
  'use strict';

  function readFileAsDataURL(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });
  }

  function alphaBounds(data,w,h,threshold=8){
    let minX=w,minY=h,maxX=-1,maxY=-1;
    let opaqueish=0,transparent=0,partial=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const a=data[(y*w+x)*4+3];
      if(a<=threshold){transparent++;continue}
      if(a<250)partial++;else opaqueish++;
      if(x<minX)minX=x;if(x>maxX)maxX=x;
      if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
    if(maxX<minX||maxY<minY)return null;
    return {minX,minY,maxX,maxY,opaqueish,transparent,partial};
  }

  fileToDataURL=function(file,max=1200,quality=.85){
    return new Promise(async(resolve,reject)=>{
      try{
        const src=await readFileAsDataURL(file);
        const img=await imageFrom(src);
        const scan=document.createElement('canvas');
        scan.width=Math.max(1,img.naturalWidth||img.width||1);
        scan.height=Math.max(1,img.naturalHeight||img.height||1);
        const sctx=scan.getContext('2d',{willReadFrequently:true});
        sctx.drawImage(img,0,0,scan.width,scan.height);
        const pixels=sctx.getImageData(0,0,scan.width,scan.height);
        const bounds=alphaBounds(pixels.data,scan.width,scan.height);

        if(!bounds){resolve(src);return}

        const fullArea=scan.width*scan.height;
        const cropW=bounds.maxX-bounds.minX+1;
        const cropH=bounds.maxY-bounds.minY+1;
        const cropArea=cropW*cropH;
        const transparentRatio=bounds.transparent/fullArea;
        const cropRatio=cropArea/fullArea;
        const hasPadding=transparentRatio>.015&&cropRatio<.985;
        const sx=hasPadding?bounds.minX:0;
        const sy=hasPadding?bounds.minY:0;
        const sw=hasPadding?cropW:scan.width;
        const sh=hasPadding?cropH:scan.height;

        const scale=Math.min(1,max/Math.max(sw,sh));
        const out=document.createElement('canvas');
        out.width=Math.max(1,Math.round(sw*scale));
        out.height=Math.max(1,Math.round(sh*scale));
        const octx=out.getContext('2d');
        octx.imageSmoothingEnabled=true;
        octx.imageSmoothingQuality='high';
        octx.drawImage(scan,sx,sy,sw,sh,0,0,out.width,out.height);

        const outPixels=octx.getImageData(0,0,out.width,out.height).data;
        let meaningfulAlpha=false;
        for(let i=3;i<outPixels.length;i+=4){if(outPixels[i]<250){meaningfulAlpha=true;break}}

        const result=meaningfulAlpha?out.toDataURL('image/png'):out.toDataURL('image/jpeg',quality);
        window.__audreyLastUploadProfile={sourceType:file?.type||'',sourceWidth:scan.width,sourceHeight:scan.height,transparentRatio:Number(transparentRatio.toFixed(3)),croppedTransparentPadding:hasPadding,outputWidth:out.width,outputHeight:out.height,outputType:meaningfulAlpha?'image/png':'image/jpeg'};
        resolve(result);
      }catch(err){reject(err)}
    });
  };

  window.__audreyPhotoUploadBugfixV132363=true;
})();
