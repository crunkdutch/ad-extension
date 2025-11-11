// ==UserScript==
// @name         Creative Injection
// @namespace    http://tampermonkey.net/
// @version      2025-10-11
// @description  Show me banners please
// @author       Zero Cool
// @match        https://www.distractify.com/p/trisha-paytas-broadway-show
// @match        https://cookieandkate.com/chickpea-tomato-soup-recipe/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=distractify.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const AD_ENDPOINT = `https://storage.cloud.kargo.com/ad/campaign/rm/test/interview-creatives.json`
  let adResponseObject = {};

  const btnLoader = document.createElement("button");
  btnLoader.textContent = 'Load Creatives';
  btnLoader.style.margin = "30px auto";
  btnLoader.style.display = "block";
  btnLoader.addEventListener('click', onMouseClick);

  const loaderContainer = document.createElement("div");
  loaderContainer.style.position = "fixed";
  loaderContainer.style.background = "radial-gradient(#e66465, #9198e5)";
  loaderContainer.style.width = 200 + "px";
  loaderContainer.style.height = 80 + "px";
  loaderContainer.style.border = "solid 1px black";
  loaderContainer.style.zIndex = "99999999";
  loaderContainer.style.top = 0;
  loaderContainer.appendChild(btnLoader)

  document.body.appendChild(loaderContainer);
  
  function onMouseClick(event) {
    loader.getData(AD_ENDPOINT);
  }

  function getMiddle(parentElement) {
    const parentDiv = parentElement.getBoundingClientRect();
    const parentCenterX = parentDiv.left + parentDiv.width / 2;
    const parentCenterY = parentDiv.top + parentDiv.height / 2;

    let closestElement = null;
    let minimumDistance = Infinity;

    const children = parentElement.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      const childCenterX = childRect.left + childRect.width / 2;
      const childCenterY = childRect.top + childRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(parentCenterX - childCenterX, 2) +
        Math.pow(parentCenterY - childCenterY, 2)
      );

      if (distance < minimumDistance) {
        minimumDistance = distance;
        closestElement = child;
      }
    }
    return closestElement;
  }

  const myDiv = document.getElementsByTagName('main');
  const middleElement = getMiddle(myDiv[0]);

  const loader = {
    getData: function (path) {
      const xhrRequest = new XMLHttpRequest();
      xhrRequest.open('GET', path);
      xhrRequest.send(null);

      xhrRequest.onreadystatechange = function () {

        if (xhrRequest.readyState === 4) {
          if (xhrRequest.status === 200) {
            if (xhrRequest.responseURL === AD_ENDPOINT) {
              adResponseObject = JSON.parse(xhrRequest.responseText);
              console.log(adResponseObject)
              app.initGrid(adResponseObject)
              btnLoader.removeEventListener('click', onMouseClick)
            }
          }
          else {
            //show some fail state
            loaderContainer.innerHTML = "Service failed to load. Try again later.";
            loaderContainer.style.color = "black";
          }
        }
      }
    }
  }

  const gridArray = [];
  const app = {
    initGrid: function (dataObject) {
      let ads = dataObject.ads;
      for (let i = 0; i < ads.length; i++) {
        const gridObject = new Object();
        gridObject.markup = ads[i].markup;
        gridObject.size = ads[i].size;
        gridObject.type = ads[i].type;
        gridObject.width = ads[i].size.substring(0, 3) // first 3
        gridObject.height = ads[i].size.substring(4) // after the "x"
        gridArray.push(gridObject);

      }

      creative.setAd()
    }
  }
  const closeButton = document.createElement("div");
  const stickyHolder = document.createElement("div");

  const creative = {
    setAd: function () {
      for (let i = 0; i < gridArray.length; i++) {
        const creativeDiv = document.createElement(`div`);
        creativeDiv.id = `creative-overlay-${i}`;
        creativeDiv.style.cssText = `display:block; position:relative; outline:1px solid black;`;
        switch (gridArray[i].type) {
          case "sticky":
            closeButton.style.display = "block";
            closeButton.textContent = "x";
            closeButton.style.outline = "1px solid black";
            closeButton.style.color = "white";
            closeButton.style.background = "radial-gradient(#e66465, #9198e5)";
            closeButton.style.width = 20 + "px";
            closeButton.style.paddingLeft = 5 + "px";
            closeButton.style.marginBottom = 5 + "px";
            closeButton.style.cursor = "pointer";
            closeButton.id = "closeButton";
            stickyHolder.style.position = "fixed";
            stickyHolder.style.top = 50 + "%";
            stickyHolder.style.zIndex = 999999;
            stickyHolder.style.left = (window.innerWidth - gridArray[i].width) / 2 + "px";
            stickyHolder.appendChild(closeButton);
            stickyHolder.appendChild(creativeDiv);
            closeButton.addEventListener("click", () => {
              stickyHolder.style.display = "none"
            });

            document.body.appendChild(stickyHolder);
            break;
          case "middle":
            creativeDiv.style.left = (myDiv[0].firstChild.clientWidth - gridArray[i].width) / 2 + "px"
            creativeDiv.style.marginBottom = "10px";
            myDiv[0].insertBefore(creativeDiv, middleElement.nextSibling)
            break;
        }

        creativeDiv.style.width = gridArray[i].width + 'px';
        creativeDiv.style.height = gridArray[i].height + "px";
        creativeDiv.innerHTML = atob(gridArray[i].markup)
      }
    }
  }
})();
