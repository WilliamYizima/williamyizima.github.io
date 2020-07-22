(function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty("append")) {
        return;
      }
      Object.defineProperty(item, "append", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function append() {
          var argArr = Array.prototype.slice.call(arguments),
            docFrag = document.createDocumentFragment();
  
          argArr.forEach(function (argItem) {
            var isNode = argItem instanceof Node;
            docFrag.appendChild(
              isNode ? argItem : document.createTextNode(String(argItem))
            );
          });
  
          this.appendChild(docFrag);
        }
      });
    });
  })([Element.prototype, Document.prototype, DocumentFragment.prototype]);
  
  var StartScreenWidget = function () {
    let BASE_URL = "https://nikestartscreen.cs.blip.ai";
    let STYLE_URL = BASE_URL + "style.css";
    let START_SCREEN_URL = BASE_URL + "/static-start-screen.html";
    let APP_KEY =
      "aW5mcmFjb21tZXJjZW5pa2Vwcm9kOjBkODkzOWY0LWEyNzAtNGFmNy1hYTllLWU2YjU0YzhiMmI1NA==";
    let BOTTOM_IMAGE_URL = BASE_URL + "/assets/images/nike_icon_white.svg";
    let TOP_IMAGE_URL = BASE_URL + "/assets/images/nike_icon_white.svg";
    let STARTING_COLOR = "#000000";
  
    var headElement = document.getElementsByTagName("head")[0];
  
    var blipChatStartScreenStyleCss = document.createElement("link");
    blipChatStartScreenStyleCss.setAttribute("rel", "stylesheet");
    blipChatStartScreenStyleCss.setAttribute("type", "text/css");
  
    var cssLocation = STYLE_URL;
  
    blipChatStartScreenStyleCss.setAttribute("href", cssLocation);
  
    var robotoFont = document.createElement("link");
    robotoFont.setAttribute("rel", "stylesheet");
    robotoFont.setAttribute(
      "href",
      "https://fonts.googleapis.com/css?family=Roboto"
    );
  
    headElement.appendChild(blipChatStartScreenStyleCss);
    headElement.appendChild(robotoFont);
  
    var self = this;
    this._widgetLocation = "https://unpkg.com/blip-chat-widget";
    this._apiUrl = "";
    this._userIdentity = null;
    this._openClassName = "blip-chat-iframe-opened";
    this._chatConnected = false;
    this._trackSequence = [];
    this._messageSequence = [];
    this._showMainDiv = false;
    this._isLoaded = false;
  
    this._bubble;
    this._bubbleContainer;
    this._closeIcon;
    this._iconId = "blip-chat-icon";
    this._closeId = "blip-chat-close-icon";
    this._chatContainer = "blip-chat-container";
    this._displayClassName = "display";
    this._hideClassName = "hide";
    this._startScreenHtmlLink = START_SCREEN_URL;
    this._appKey = APP_KEY;
    this._startingColor = STARTING_COLOR;
    this._bottomImage = BOTTOM_IMAGE_URL;
    this._topImage = TOP_IMAGE_URL;
    this._bubbleMessage = "Oi, como posso te ajudar?";
    this._maxMobileWidth = 425;
    this._maxMobileHeight = 812;
    this._blipChatLoadSuccessful = false;
  
    this.displayBubble = function () {
      self._bubble.classList.add(self._displayClassName);
      self._bubble.classList.remove(self._hideClassName);
    };
    this.hideBubble = function () {
      self._bubble.classList.add(self._hideClassName);
      self._bubble.classList.remove(self._displayClassName);
    };
    this.changeBubble = function () {
      if (self._bubble.classList.contains(self._displayClassName))
        self._hideBubble();
      else self._displayBubble();
    };
    this.createBubble = function () {
      self._bubbleContainer = document.createElement("div");
      self._bubbleContainer.id = "bubble-container";
  
      self._bubble = document.createElement("div");
      self._bubble.id = "message-bubble";
      self._bubble.onclick = function () {
        self.chat.widget._openChat();
      };
  
      var triangle = document.createElement("div");
      triangle.id = "triangle";
  
      var message = document.createElement("div");
      message.id = "message";
      message.innerHTML = self._bubbleMessage;
  
      self._bubble.appendChild(message);
      self._bubble.appendChild(triangle);
      self._bubbleContainer.appendChild(self._bubble);
  
      document
        .querySelector(`#${self._chatContainer}`)
        .prepend(self._bubbleContainer);
    };
  
    this.replaceImageStructure = function () {
      self._closeIcon = document.querySelector(`#${self._closeId}`);
      var oldImage = document.querySelector(`#${self._iconId}`);
  
      var container = document.createElement("div");
      container.id = self._iconId;
  
      var img1 = document.createElement("img");
      img1.src = self._topImage;
      img1.classList.add("top");
  
      var img2 = document.createElement("img");
      img2.src = self._bottomImage;
      img2.classList.add("bottom");
  
      container.appendChild(img1);
      container.appendChild(img2);
  
      oldImage.parentElement.insertBefore(container, oldImage);
      oldImage.remove();
    };
    this.ToggleStartScreen = function (toHide) {
      var startScreen = document.getElementById("start-screen");
      var mainDiv = document.getElementById("blip-chat-start-screen");
      var chatOver = document.getElementById("blip-chat-button-over");
  
      if (mainDiv) {
        if (toHide) {
          startScreen.classList.add("hide");
          mainDiv.classList.add("slide");
          if (!self._blipChatLoadSuccessful) {
            self._showMainDiv = true;
          } else {
            chatOver.classList.add("show");
          }
        } else {
          startScreen.classList.remove("hide");
          chatOver.classList.remove("show");
          mainDiv.classList.remove("slide");
        }
      }
    };
    this.trackStartScreen = function () {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          self._apiUrl +
          "/utils/track/start-screen?userIdentity=" +
          self._userIdentity,
          true
        );
        xhr.send();
      } catch (e) {
        /*do nothing*/
      }
    };
    this.trackCloseStartScreen = function () {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          self._apiUrl +
          "/utils/track/close-start-screen?userIdentity=" +
          self._userIdentity,
          true
        );
        xhr.send();
      } catch (e) {
        /*do nothing*/
      }
    };
    this.enqueueTrackFunction = function (fnc) {
      self._trackSequence.push(fnc);
  
      if (self._userIdentity) {
        while (self._trackSequence.length) {
          var func = self._trackSequence.splice(0, 1)[0];
          func();
        }
      }
    };
    this.sendMessage = function (msg, contentType) {
      var sendMessageFunction = function () {
        self.chat.sendMessage({
          type: "text/plain",
          content: msg,
          metadata: {
            sendFromStartScreen: 1,
            contentType: contentType
          }
        });
      };
  
      if (self._chatConnected) {
        sendMessageFunction();
      } else {
        self._messageSequence.push(sendMessageFunction);
      }
  
      self.ToggleStartScreen(true);
    };
    this.processActionByElement = function (element) {
      if (!element.attributes || element.attributes.length === 0) {
        return 0;
      }
      var payload = element.getAttribute("payload");
  
      if (payload) {
        if (payload.indexOf(":") >= 0) {
          var payloadItems = payload.split(":");
          var selectorId = payloadItems[payloadItems.length - 1];
          var message = document.getElementById(selectorId).value;
          if (message) {
            self.sendMessage(message, payloadItems[0]);
          }
        } else {
          self.sendMessage(payload, "click");
        }
        return 1;
      } else if (element.getAttribute("close-start-screen")) {
        self.toggleIframe(false);
        self.enqueueTrackFunction(self.trackCloseStartScreen);
        self.chat.widget._openChat();
        return 1;
      }
      return 0;
    };
    this.handler = function () {
      document.addEventListener("click", function (event) {
        if (event.srcElement) {
          if (self.processActionByElement(event.srcElement) === 1) {
            return;
          }
  
          for (var j = 0; j < event.srcElement.childElementCount; j++) {
            if (self.processActionByElement(event.srcElement.children[j]) === 1) {
              return;
            }
          }
        }
  
        if (
          event.parentElement &&
          self.processActionByElement(event.parentElement) === 1
        ) {
          return;
        }
      });
  
      window.addEventListener("message", function (message) {
        if (message.data.code === "ChatConnected") {
          self._chatConnected = true;
  
          if (!self._userIdentity && localStorage.getItem("blipSdkUAccount")) {
            var obj = JSON.parse(atob(localStorage.getItem("blipSdkUAccount")));
            if (obj && obj.userIdentity) {
              self._userIdentity = obj.userIdentity;
            }
          }
  
          if (self._userIdentity) {
            while (self._trackSequence.length) {
              var fnc = self._trackSequence.splice(0, 1)[0];
              fnc();
            }
          }
  
          while (self._messageSequence.length) {
            var msgFnc = self._messageSequence.splice(0, 1)[0];
            msgFnc();
          }
        }
      });
    };
    this.isOpened = function () {
      var blipChatFrame = document.getElementById("blip-chat-open-iframe");
      return !(
        blipChatFrame &&
        blipChatFrame.classList &&
        !blipChatFrame.classList.contains("opened")
      );
    };
    this.openChatBot = function () {
      if (!self.isOpened()) {
        document.getElementById("blip-chat-open-iframe").click();
      }
    };
  
    this.hideChatBot = function () {
      var iframeContainer = document.getElementById("blip-chat-container");
      iframeContainer.style.display = "none";
    };
  
    this.showChatBot = function () {
      var iframeContainer = document.getElementById("blip-chat-container");
      iframeContainer.style.display = "block";
    };
  
    this.showAndOpenChatBot = function () {
      var iframeContainer = document.getElementById("blip-chat-container");
      iframeContainer.style.display = "block";
      if (!self.isOpened()) {
        document.getElementById("blip-chat-open-iframe").click();
      }
    };
  
    this.hideAndCloseChatBot = function () {
      var iframeContainer = document.getElementById("blip-chat-container");
      iframeContainer.style.display = "none";
      if (self.isOpened()) {
        document.getElementById("blip-chat-open-iframe").click();
      }
    };
  
    this.toggleIframe = function (visible) {
      var iframeContainer = document.getElementById("blip-chat-iframe-container");
  
      if (!visible) {
        setTimeout(function () {
          if (!self.isOpened()) {
            setTimeout(function () {
              iframeContainer.classList.add("hide");
            }, 300);
          }
        }, 100);
      } else {
        setTimeout(function () {
          if (
            iframeContainer.classList &&
            iframeContainer.classList.contains("hide")
          ) {
            iframeContainer.classList.remove("hide");
          }
        }, 0);
      }
    };
    this.reorderIframe = function () {
      self.container = document.createElement("div");
      self.container.id = "blip-chat-iframe-container";
  
      document.querySelector("#blip-chat-container").append(self.container);
  
      self.startScreen = document.createElement("div");
      self.startScreen.id = "blip-chat-start-screen";
  
      self.chatOver = document.createElement("div");
      self.chatOver.id = "blip-chat-button-over";
  
      self.iframe = document.querySelector("#blip-chat-iframe");
  
      fetch(self._startScreenHtmlLink)
        .then(function (r) {
          return r.text();
        })
        .then(function (content) {
          self.startScreen.innerHTML = content;
          self.chatOver.innerHTML =
            '<div id="chat-over"><div id="back-menu-icon"><img src="https://az-infobots.take.net/customercare/StaticFiles/image/back_menu.svg" alt="" /></div></div>';
  
          self.container.append(self.iframe);
          self.container.append(self.chatOver);
          self.container.append(self.startScreen);
        })
        .then(function (c) {
          document
            .getElementById("question-input-recall")
            .addEventListener("keyup", function (event) {
              if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("click-question-recall").click();
              }
            });
  
          document
            .getElementById("question-input")
            .addEventListener("keyup", function (event) {
              if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("click-question").click();
              }
            });
  
          document
            .getElementById("blip-chat-close-icon")
            .addEventListener("click", function (event) {
              self.toggleIframe(false);
              self.enqueueTrackFunction(self.trackCloseStartScreen);
            });
  
          document
            .getElementById("chat-over")
            .addEventListener("click", function (event) {
              self.ToggleStartScreen(false);
            });
  
          document
            .getElementById("blip-chat-open-iframe")
            .addEventListener("click", function (event) {
              self.toggleIframe(!self.isOpened());
            });
  
          var scrollDownObj = document.getElementById("bottom-section");
          var toScrollDownObj = document.getElementsByClassName(
            "start-screen-content"
          )[0];
  
          scrollDownObj.addEventListener("click", function (event) {
            var lastScrollTopValue = 0;
            var timer = setInterval(function () {
              lastScrollTopValue = toScrollDownObj.scrollTop;
              toScrollDownObj.scrollTop += 3;
              if (toScrollDownObj.scrollTop <= lastScrollTopValue) {
                clearInterval(timer);
              }
            }, 1);
  
            scrollDownObj.classList.add(self._hideClassName);
          });
  
          toScrollDownObj.addEventListener("scroll", function (event) {
            if (
              toScrollDownObj.scrollHeight - toScrollDownObj.scrollTop <=
              toScrollDownObj.getBoundingClientRect().height
            ) {
              scrollDownObj.classList.add(self._hideClassName);
            }
          });
  
          setTimeout(function () {
            document
              .getElementById("blip-chat-iframe")
              .setAttribute("style", "opacity:1 !important");
            document
              .getElementById("start-screen")
              .setAttribute("style", "opacity:1 !important");
          }, 0);
        });
    };
    this.loadBlipExtension = function () {
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = self._widgetLocation;
        script.onload = resolve;
        document.head.append(script);
      });
    };
    this.loadWidget = function (appKey) {
      self.chat = new BlipChat()
        .withAppKey(appKey)
        .withButton({ color: self._startingColor })
        .withEventHandler(BlipChat.LOAD_EVENT, function () {
          var iframe = document.getElementById("blip-chat-iframe");
          iframe.contentWindow.postMessage(
            { code: "ShowCloseButton", showCloseButton: true },
            iframe.src
          );
          self._blipChatLoadSuccessful = true;
          if (self._showMainDiv) {
            document
              .getElementById("blip-chat-button-over")
              .classList.add("show");
            self._showMainDiv = false;
          }
        })
        .withEventHandler(BlipChat.ENTER_EVENT, function () {
          if (!self._isLoaded) {
            self.reorderIframe();
          } else {
            self.ToggleStartScreen(false);
          }
          self._isLoaded = true;
          self._closeIcon.classList.add(self._displayClassName);
          self._closeIcon.classList.remove(self._hideClassName);
          self.hideBubble();
  
          if (localStorage.getItem("blipSdkUAccount")) {
            var obj = JSON.parse(atob(localStorage.getItem("blipSdkUAccount")));
            if (obj && obj.userIdentity) {
              self._userIdentity = obj.userIdentity;
            }
          }
  
          self.enqueueTrackFunction(self.trackStartScreen);
  
          self.container.classList.add(self._openClassName);
  
          self.toggleIframe(true);
        })
        .withEventHandler(BlipChat.LEAVE_EVENT, function () {
          self.container.classList.remove(self._openClassName);
          self._closeIcon.classList.add(self._hideClassName);
          self._closeIcon.classList.remove(self._displayClassName);
          self.container.classList.add(self._hideClassName);
        });
  
      self.chat.build();
      self.replaceImageStructure();
      self.createBubble();
  
      self.displayBubble();
      setTimeout(function () {
        self.hideBubble();
      }, 10000);
    };
    this.load = function () {
      self.loadBlipExtension().then(function () {
        self.loadWidget(self._appKey);
      });
      self.handler();
    };
  
  
  
  
    this.loadWidgetHide = function (appKey) {
      self.chat = new BlipChat()
        .withAppKey(appKey)
        .withButton({ color: self._startingColor })
        .withEventHandler(BlipChat.LOAD_EVENT, function () {
          var iframe = document.getElementById("blip-chat-iframe");
          iframe.contentWindow.postMessage(
            { code: "ShowCloseButton", showCloseButton: true },
            iframe.src
          );
          self._blipChatLoadSuccessful = true;
          if (self._showMainDiv) {
            document
              .getElementById("blip-chat-button-over")
              .classList.add("show");
            self._showMainDiv = false;
          }
        })
        .withEventHandler(BlipChat.ENTER_EVENT, function () {
          if (!self._isLoaded) {
            self.reorderIframe();
          } else {
            self.ToggleStartScreen(false);
          }
          self._isLoaded = true;
          self._closeIcon.classList.add(self._displayClassName);
          self._closeIcon.classList.remove(self._hideClassName);
          self.hideBubble();
  
          if (localStorage.getItem("blipSdkUAccount")) {
            var obj = JSON.parse(atob(localStorage.getItem("blipSdkUAccount")));
            if (obj && obj.userIdentity) {
              self._userIdentity = obj.userIdentity;
            }
          }
  
          self.enqueueTrackFunction(self.trackStartScreen);
  
          self.container.classList.add(self._openClassName);
  
          self.toggleIframe(true);
        })
        .withEventHandler(BlipChat.LEAVE_EVENT, function () {
          self.container.classList.remove(self._openClassName);
          self._closeIcon.classList.add(self._hideClassName);
          self._closeIcon.classList.remove(self._displayClassName);
          self.container.classList.add(self._hideClassName);
        });
  
      self.chat.build();
      self.replaceImageStructure();
      self.createBubble();
      self.hideChatBot();
  
      self.displayBubble();
      setTimeout(function () {
        self.hideBubble();
      }, 10000);
    };
    this.loadHide = function () {
      self.loadBlipExtension().then(function () {
        self.loadWidgetHide(self._appKey);
      });
      self.handler();
    };
  };
  