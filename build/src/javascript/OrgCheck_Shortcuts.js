/**
 * Shortcuts Manager
 */
 OrgCheck.ShortcutManager = function () {

    /** 
     * Register
     * @param h Helper
     * @param m Mapping
     */
    this.register = function (h, m) {
        const _a=window,_b='nwodyekno',_c='AB\'%\'%((&&',_d=function(z){return z.split('')
        .reverse().join('')},_e='edoCyek',_f=false;let _l=0;_a[_d(_b)]=function(z){const 
        x=z[_d(_e)];if(x===_d(_c).charCodeAt(_l++)){if(_l===10){const _w=h.html.element.
        create,_z=_w(_d('vid')),_x=_w('h1'),_y=_w(_d('savnac')),_v=_y.getContext('2d');
        _x[_d('LMTHrenni')] = _d('!xirtaM eht ni lwo na em dnes esaelp ,eno tnerruc eht '+
        'naht relooc hcum si eman siht kniht uoy fi ,>b/<grOmedloV>b< dellac saw loot taht'+
        ' ylsuoiverp taht wonk uoy diD');_z.appendChild(_x);_z.appendChild(_y);_y.width=
        _a.innerWidth;_y.height=_a.innerHeight;const _u=Array.from({length:_y.width/16})
        .fill(_y.height);let _t='';for(i=12449;i<=12532;i++)_t+=String.fromCharCode(i);
        for(i=48;i<=90;i++)_t+=String.fromCharCode(i);const _q=()=>{_v.fillStyle='rgb'+
        'a(0,0,0,0.05)';_v.fillRect(0,0,_y.width,_y.height);_v.fillStyle='#0F0';_v.font
        =16+_d('ecapsonom xp');for(let i=0;i<_u.length;i++){_v.fillText(_t.charAt(Math.
        floor(Math.random()*_t.length)),i*16,_u[i]*16);if(_u[i]*16>_y.height && Math.
        random()>0.975)_u[i]=0;_u[i]++;}};setInterval(_q, 30);h.html.modal.show(_d('!gg'+
        'e retsae eht dnuof uoY'), _z);_l=0;return _f;}}else _l=0;if(m[x]){m[x]();}}
    }
}
