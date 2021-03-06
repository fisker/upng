import estats from './estats.mjs'
import planeDst from './planeDst.mjs'
import getKDtree from './getKDtree.mjs'
import getNearest from './getNearest.mjs'

function quantize(abuf, ps)
{
	var oimg = new Uint8Array(abuf), nimg = oimg.slice(0), nimg32 = new Uint32Array(nimg.buffer);

	var KD = getKDtree(nimg, ps);
	var root = KD[0], leafs = KD[1];

	var sb = oimg, tb = nimg32, len=sb.length;

	var inds = new Uint8Array(oimg.length>>2), nd;
	if(oimg.length<20e6)  // precise, but slow :(
		for(var i=0; i<len; i+=4) {
			var r=sb[i]*(1/255), g=sb[i+1]*(1/255), b=sb[i+2]*(1/255), a=sb[i+3]*(1/255);

			nd = getNearest(root, r, g, b, a);
			inds[i>>2] = nd.ind;  tb[i>>2] = nd.est.rgba;
		}
	else
		for(var i=0; i<len; i+=4) {
			var r=sb[i]*(1/255), g=sb[i+1]*(1/255), b=sb[i+2]*(1/255), a=sb[i+3]*(1/255);

			nd = root;  while(nd.left) nd = (planeDst(nd.est,r,g,b,a)<=0) ? nd.left : nd.right;
			inds[i>>2] = nd.ind;  tb[i>>2] = nd.est.rgba;
		}
	return {  abuf:nimg.buffer, inds:inds, plte:leafs  };
}

export default quantize
