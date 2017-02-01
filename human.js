// човече - с възможност за движение на ставите,
// създадено специално за второто домашно по ОКГ


// помощни функции за работа с градуси
function rad(x) {return x*Math.PI/180;}
function sin(x) {return Math.sin(rad(x));}
function cos(x) {return Math.cos(rad(x));}

// цветове и вградени текстури за glava и крайници
var feminine = true; //jenstvenа фигура
var colors = ['cornsilk','black','lightskyblue','royalblue','lightskyblue','lightskyblue','firebrick']; // [glava,Obuvka,Taz,сферички,Krajnik,Tors,]
var headScale = 1.0;
var texHead = new THREE.TextureLoader().load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAAGFBMVEX////Ly8v5+fne3t5GRkby8vK4uLi/v7/GbmKXAAAAZklEQVRIx2MYQUAQHQgQVkBtwEjICkbK3MAkQFABpj+R5ZkJKTAxImCFSSkhBamYVgiQrAADEHQkIW+iqiBCAfXjAkMHpgKqgyHgBiwBRfu4ECScYEZGvkD1JxEKhkA5OVTqi8EOAOyFJCGMDsu4AAAAAElFTkSuQmCC");
var texLimb = new THREE.TextureLoader().load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAABlBMVEX////Ly8vsgL9iAAAAHElEQVQoz2OgEPyHAjgDjxoKGWTaRRkYDR/8AAAU9d8hJ6+ZxgAAAABJRU5ErkJggg==");

// изчислява на издутина
function cossers(u,v,params)
{
	function cosser(t, min, max, last)
	{
		if (t<min && !last) return cosser(t+1, min, max, true);
		if (t>max && !last) return cosser(t-1, min, max, true);
		if( min<=t && t<=max )
			return 0.5+0.5*Math.cos( (t-min)/(max-min)*2*Math.PI-Math.PI );
		return 0;
	}
	var r = 1;
	for (var i=0; i<params.length; i++)
		r += cosser(u,params[i][0],params[i][1])*cosser(v,params[i][2],params[i][3])/params[i][4];
	return r;
}

// създаване на параметрична повърхност чрез функцията ѝ
function parametricImage(tex,col,func)
{
	var image = new THREE.Object3D();
	image.add( new THREE.Mesh(
		new THREE.ParametricGeometry(func, 32, 32),
		new THREE.MeshPhongMaterial({color:col,shininess:100,map: tex})
	));
	return image;
}
function cyl(r1,r2,h)
{
	var geometry = new THREE.CylinderGeometry( r1, r2, h, 32 );
	var material = new THREE.MeshPhongMaterial({color:"black",shininess:100})
	var cylinder = new THREE.Mesh( geometry, material );
	return cylinder;
}

// forma на glava като параметрична повърхнина
function formaglava(params)
{
	var glav = parametricImage(texHead,colors[0],function (u,v)
	{
		var r = cossers(u,v,[[0.4,0.9,0,1,-3],[0,1,0,0.1,3],[0,1,0.9,1,3],[1.00,1.05,0.55,0.85,-5],[1.00,1.05,0.15,0.45,-5],[0.9,0.94,0.25,0.75,-5],[0.0,0.7,0.05,0.95,3],[-0.2,0.2,-0.15,1.15,-4],[-0.3,0.3,0.15,0.85,3]]);
		u = 360*u;
		v = 180*v-90;
		k = (1+(feminine?1:2)*sin(u)*cos(v))/4;
		return new THREE.Vector3(
			headScale*r*params[1]*cos(u)*cos(v),
			headScale*r*params[2]*sin(u)*cos(v),
			headScale*(r+k)*params[3]*sin(v));
	});
	var cyl1 = cyl(3,3,10);
	var cyl2 = cyl(5,5,0.6);
	cyl1.position.y+=5;
	cyl2.position.y+=3.3;
	glav.add(cyl1);
	glav.add(cyl2);
	return glav;
}

// forma на Obuvka като параметрична повърхнина
function formaObuvka(params)
{
	var image = new THREE.Object3D();
	image.add(parametricImage(texLimb,colors[1],function (u,v)
	{
		var r = cossers(u,v,[[0.6,1.1,0.05,0.95,1],[0.60,0.8,0.35,0.65,feminine?0.6:1000]]);
		u = 360*u;
		v = 180*v-90;
		return new THREE.Vector3(
			(3*r-2)*params[1]*(cos(u)*cos(v)+(feminine?(Math.pow(sin(u+180),2)*cos(v)-1):0)),
			params[2]*sin(u)*cos(v),
			params[3]*sin(v));
	}));
	if (feminine)
	{
		image.add(parametricImage(texLimb,colors[4],function (u,v)
		{
			var r = cossers(u,v,[[0.6,1.1,0.05,0.95,1/2]]);
			u = 360*u;
			v = 180*v-90;
			return new THREE.Vector3(
				0.3*(3*r-2)*params[1]*(cos(u)*cos(v)),
				0.8*params[2]*sin(u)*cos(v),
				0.6*params[3]*sin(v));
		}));
	}

	return image;
}

// forma на Taz като параметрична повърхнина
function formaTaz(params)
{
	return parametricImage(texLimb,params[0],function (u,v)
	{
		var r = cossers(u,v,[[0.6,0.95,0,1,4],[0.7,1.0,0.475,0.525,-13],[0.0,0.3,0.3,0.9,feminine?1000:5],[-0.2,0.3,0,0.3,-4],[-0.2,0.3,-0.3,0,-4]]);
		u = 360*u-90;
		v = 180*v-90;
		return new THREE.Vector3(
			-1.5+r*params[1]*cos(u)*Math.pow(cos(v),0.6),
			r*params[2]*sin(u)*Math.pow(cos(v),0.6),
			r*params[3]*sin(v));
	});
}

// добавя сферична stava към образ
function addSphere(image,r,y,j_color)
{
	var i = new THREE.Mesh(
		new THREE.SphereGeometry(r*1.3, 16, 16),
		new THREE.MeshPhongMaterial({color:j_color,shininess:100})
	);
	i.position.set(0,y,0);
	image.add(i);
}
	
// forma на Krajnik като параметрична повърхнина
function formaKrajnik(params)
{
	var x=params[1], y=params[2], z=params[3], alpha=params[4], dAlpha=params[5], offset=params[6], scale=params[7], rad=params[8];

	var image = parametricImage(texLimb,params[0], function (u,v)
	{
		v = 360*v;
		var r = offset+scale*cos(alpha+dAlpha*u);
		var v = new THREE.Vector3(x*r*cos(v)/2,y*u,z*r*sin(v)/2);
		var w = new THREE.Vector3(
			x*cos(v)*cos(180*u-90)/2,
			y2 = y*(1/2+sin(180*u-90)/2),
			z2 = z*sin(v)*cos(180*u-90)/2);
		return v.lerp(w,Math.pow(Math.abs(2*u-1),16));
	});
	image.children[0].position.set(0,-y/2,0);

	addSphere(image,rad?rad:z/2,-y/2,params[0]);
	
	return image;
}

// forma на Tors като параметрична повърхнина
function formaTors(params)
{
	var x=params[1], y=params[2], z=params[3], alpha=params[4], dAlpha=params[5], offset=params[6], scale=params[7];
	var part_color=params[0];
	var image = parametricImage(texLimb,part_color, function (u,v)
	{
		var r = offset+scale*cos(alpha+dAlpha*u);
		if (feminine) r += cossers(u,v,[[0.35,0.85,0.7,0.95,2],[0.35,0.85,0.55,0.8,2]])-1;
		v = 360*v+90;
		var x1 = x*(0.3+r)*cos(v)/2;
		var y1 = y*u;
		var z1 = z*r*sin(v)/2;
		var x2 = x*cos(v)*cos(180*u-90)/2;
		var y2 = y*(1/2+sin(180*u-90)/2);
		var z2 = z*sin(v)*cos(180*u-90)/2;
		var k = Math.pow(Math.abs(2*u-1),16);
		var kx = Math.pow(Math.abs(2*u-1),2);
		if (x2<0) kx=k;
		return new THREE.Vector3(x1*(1-kx)+kx*x2,y1*(1-k)+k*y2,z1*(1-k)+k*z2);
	});
	image.children[0].position.set(0,-y/2,0);

	addSphere(image,3,-y/2,params[0]);

	return image;
}

// дефиниция на подвижна stava с възможност за подстави
function stava(parent,pos,rot,params,shape,centered)
{
	var y = params[2];
	var joint = new THREE.Object3D();
	
	var image = shape?shape(params):new THREE.Object3D();
	if (!centered) image.position.set(0,y/2,0);

	var userJoint = new THREE.Object3D();
	userJoint.add(image);
	joint.add(userJoint);
	joint.y=y;
	
	if (parent)
	{	// закачане на stavaта към родителската stava
		joint.position.set(0,parent.y,0);
		parent.children[0].add(joint);
	}
	
	joint.vryt = function(x,y,z)
	{	// "публичен" метод за въртене на stava
		this.children[0].rotation.set(rad(x),rad(y),rad(z));
	}
	
	if (rot)
	{	// първоначално завъртане на stavaта
		joint.rotateX(rad(rot[0]));
		joint.rotateZ(rad(rot[2]));
		joint.rotateY(rad(rot[1]));
	}
	
	if (pos)
	{	// първоначално разположение на stavaта
		joint.position.set(pos[0],pos[1],pos[2]);
	}
	
	return joint;
}

// дефиниция на човече
function chovek()
{
	var obj = stava(null,null,null,["blue",1,1,1],null,true);
	
	obj.Taz = stava(obj,null,[0,0,-20],[colors[6],3,4,feminine?5.5:5],formaTaz,true);
		obj.tqlo = stava(obj.Taz,[-2,4,0],[0,0,20],["blue",5,17,10,feminine?10:80,feminine?520:380,feminine?0.8:0.9,feminine?0.25:0.2],formaTors);
		obj.vrat = stava(obj.tqlo,[0,15,0],[0,0,10],[colors[0],2,feminine?5:4,2,45,60,1,0.2,0],formaKrajnik);
		obj.glava = stava(obj.vrat,[1,3,0],null,[colors[0],3,4,2.5],formaglava);
	obj.l_krak = stava(obj.Taz,[0,-3,-4],[0,180,200],[colors[6],4,15,4,-70,220,1,0.3,2],formaKrajnik);
	//obj.l_krak.material.color=new THREE.Color("black");
		obj.l_kolqno = stava(obj.l_krak,null,null,[colors[6],4,14,4,-40,290,0.65,0.15,1.5],formaKrajnik);
		obj.l_glezen = stava(obj.l_kolqno,null,[0,0,-90],[colors[6],1,4,2],formaObuvka);
	obj.d_krak = stava(obj.Taz,[0,-3,4],[0,180,200],[colors[6],4,15,4,-70,220,1,0.3,2],formaKrajnik);
		obj.d_kolqno = stava(obj.d_krak,null,null,[colors[6],4,14,4,-40,290,0.65,0.15,1.5],formaKrajnik);
		obj.d_glezen = stava(obj.d_kolqno,null,[0,0,-90],["blue",1,4,2],formaObuvka);
	obj.l_hand = stava(obj.tqlo,[0,14,feminine?-5:-6],[10,-180,180],["blue",3.5,11,2.5,-90,360,0.9,0.2,1.5],formaKrajnik);
		obj.l_lakyt = stava(obj.l_hand,null,null,[colors[0],2.5,9,2,-40,150,0.5,0.45,1.1],formaKrajnik);
		obj.l_kitka = stava(obj.l_lakyt,null,null,[colors[0],1.5,6,3.5,-100,230,0.5,0.3,1/2],formaKrajnik);
	obj.d_ryka = stava(obj.tqlo,[0,14,feminine?5:6],[-10,180,-180],["blue",3.5,11,2.5,-90,360,0.9,0.2,1.5],formaKrajnik);
		obj.d_lakyt = stava(obj.d_ryka,null,null,[colors[0],2.5,9,2,-40,150,0.5,0.45,1.1],formaKrajnik);
		obj.d_kitka = stava(obj.d_lakyt,null,null,[colors[0],1.5,6,3.5,-100,230,0.5,0.3,1/2],formaKrajnik);

	scene.add(obj);
	return obj;
}

// дефиниции на човечета с леко mujestvenи или jenstvenи черти
function mujestven() {feminine=false; return chovek();} 
function jenstven() {feminine=true; return chovek();} 