// AFRAME Exporter for Blender - https://silverslade.itch.io/a-frame-blender-exporter 

window.addEventListener('enter-vr', e => {
  if (AFRAME.utils.device.checkHeadsetConnected()) {
    if (document.getElementById("cursor")) {
      document.getElementById("cursor").remove();
    }
  }
});

// Components
AFRAME.registerComponent('toggle-handler', {
  schema: {
    target: { default: '#' }
  },
  init: function () {
    var data = this.data;
    //alert(data.target);
    var toggle_obj = document.getElementById(data.target);
    if (toggle_obj) {
      toggle_obj.setAttribute("visible", "false");
    }

    this.el.addEventListener('click', function () {
      var toggle_obj = document.getElementById(data.target);
      let value = toggle_obj.getAttribute("visible");
      if (value == true) {
        toggle_obj.setAttribute("visible", "false");
      }
      else {
        toggle_obj.setAttribute("visible", "true");
      }
    })
  }
});

AFRAME.registerComponent('link-handler', {
  schema: {
    target: { default: '#' }
  },
  init: function () {
    var data = this.data;
    this.el.addEventListener('click', function () {
      //alert(data.target);
      if (data.target != "") {
        //window.location.href = data.target;
        window.open(data.target);
      }
    })
  }
});

// click to jump next images
AFRAME.registerComponent('images-handler', {

  init: function () {
    var data = this.data;
    //alert(data.target);
    //let images = this.data.array;
    this.el.addEventListener('click', function () {
      //this.setAttribute('color', data.color);        
      //alert(data.action);
      let value = this.getAttribute("src");
      //alert(value);
      if (value == "#image_1") {
        this.setAttribute("src", "#image_2");
      }
      else {
        this.setAttribute("src", "#image_1");
      }
    })
  }
});


// init function is called after onload event
function init() {
  var isMobile = AFRAME.utils.device.isMobile();
  if (isMobile) {
    // do stuff
  }
}

/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 * From: https://github.com/colinfizgig/aframe_Components/blob/master/components/light-map-geometry.js
 */
AFRAME.registerComponent('light-map-geometry', {
  schema: {
    path: { default: '' },
    format: { default: 'RGBFormat' },
    intensity: { default: 1.0 }
  },

  init: function () {
    const data = this.data;
    const el = this.el;
    this.texture = new THREE.TextureLoader().load(data.path);
    this.intensity = data.intensity;
    this.applyLightMap();
    this.el.addEventListener('object3dset', this.applyLightMap.bind(this));
  },

  applyLightMap: function () {
    const mesh = this.el.getObject3D('mesh');
    const lightMap = this.texture;
    this.texture.flipY = false;
    const el = this.el
    const value = this.intensity;

    if (!mesh) return;
    mesh.traverse(function (node) {
      //if (node.geometry && node.geometry.type == "BufferGeometry") {
      //console.log(node);
      //console.log(node.geometry.attributes);
      //node.geometry.attributes.uv2 = node.geometry.attributes.uv.clone();
      //}
      if (node.material && 'lightMap' in node.material) {
        node.material.lightMap = lightMap;
        node.material.lightMapIntensity = value;
        node.material.needsUpdate = true;
      }
    });
  }
});

	AFRAME.registerComponent('play-on-click', {
	  init: function () {
		this.onClick = this.onClick.bind(this);
	  },
	  play: function () {
		window.addEventListener('click', this.onClick);
	  },
	  pause: function () {
		window.removeEventListener('click', this.onClick);
	  },
	  onClick: function (evt) {
		var videoEl = this.el.getAttribute('material').src;
		if (!videoEl) { return; }
		this.el.object3D.visible = true;
		videoEl.play();
	  }
	});
	
	 AFRAME.registerComponent("material-values", {
        multiple: true,
        schema: {
          materialName: { type: "string", default: "" },
          color: { type: "color", default: "" },
          map: { type: "string", default: "" },
          metalness: { type: "number", default: -1, min: 0, max: 1 },
          roughness: { type: "number", default: -1, min: 0, max: 1 },
          opacity: { type: "number", default: 1, min: 0, max: 1 },
        },

        events: {
          "model-loaded": function () {
            this.update();
          },
        },

        init() {
          this.rendererSystem = this.el.sceneEl.systems.renderer;
        },

        update: function () {
          const mesh = this.el.getObject3D("mesh");
          if (!mesh) return;

          const materialName = this.data.materialName;
          const color = this.data.color;
          const map = this.data.map;
          const metalness = this.data.metalness;
          const roughness = this.data.roughness;
          const opacity = this.data.opacity;
          mesh.traverse((node) => {
            if (node.material && node.material.name === materialName) {
              if (color !== "") {
                node.material.color.set(color);
                // The following line calls node.material.color.convertSRGBToLinear() when <a-scene renderer="colorManagement:true">
                this.rendererSystem.applyColorCorrection(node.material.color);
              } else {
                this.data.color = "#" + node.material.color.getHexString();
              }

              if (metalness !== -1) {
                node.material.metalness = metalness;
              } else {
                this.data.metalness = node.material.metalness;
              }

              if (roughness !== -1) {
                node.material.roughness = roughness;
              } else {
                this.data.roughness = node.material.roughness;
              }

              if (map) {
                const imageSrc = map;
                const loader = new THREE.TextureLoader();
                loader.load(
                  imageSrc,
                  function (texture) {
                    if (node.material.map) {
                      texture.encoding = node.material.map.encoding;
                      texture.flipY = node.material.map.flipY;
                      texture.offset.copy(node.material.map.offset);
                      texture.repeat.copy(node.material.map.repeat);
                      texture.wrapS = node.material.map.wrapS;
                      texture.wrapT = node.material.map.wrapT;
                      node.material.map.dispose();
                    }
                    node.material.map = texture;
                    texture.needsUpdate = true;
                    node.material.needsUpdate = true;
                  },
                  undefined,
                  function () {
                    console.error(`Error loading ${imageSrc}`);
                  }
                );
              }
              node.material.opacity = opacity;
              node.material.transparent = opacity < 1;
              node.material.needsUpdate = true;
            }
          });
        },
      });