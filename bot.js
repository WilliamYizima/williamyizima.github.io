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
        console.log('Iniciando bot...')
        let BASE_URL = "https://chat.blip.ai/";
        // let BASE_URL = "http://localhost:8080";// Local onde está hospedado minha instancia do blip
        // let STYLE_URL = "style-bot.css";// Local onde está hospedado meu css do blip chat
        let STYLE_URL = "https://williamyizima.github.io/style-bot.css";// Local onde está hospedado meu css do blip chat
        // let START_SCREEN_URL = "form.html";// Local onde está meu html padrão, aqui já tem o css do start-screen
        let START_SCREEN_URL = "https://williamyizima.github.io/form"
        let APP_KEY = "cGF1bDI6NTI0ODc0ZTMtZDkxNS00NzZlLWFmZGEtNGI2Y2RhZmU4MzAz";
        let BOTTOM_IMAGE_URL = "https://s3-sa-east-1.amazonaws.com/infobots/fiat/customer-care/icon-white-vector.svg";// Meu logo inicial
        // let TOP_IMAGE_URL = "chat01.svg";// Meu logo final
        let TOP_IMAGE_URL = "https://williamyizima.github.io/chat01.svg";// Meu logo final
        let STARTING_COLOR = "#ffffff";// Cor inicial da bolinha

        //inicio insere o css do blip 
        var headElement = document.getElementsByTagName("head")[0];

        var blipChatStartScreenStyleCss = document.createElement("link");
        blipChatStartScreenStyleCss.setAttribute("rel", "stylesheet");
        blipChatStartScreenStyleCss.setAttribute("type", "text/css");

        var cssLocation = STYLE_URL;

        blipChatStartScreenStyleCss.setAttribute("href", cssLocation);
        //fim

        //Inicio Insere a font roboto
        var robotoFont = document.createElement("link");
        robotoFont.setAttribute("rel", "stylesheet");
        robotoFont.setAttribute(
            "href",
            "https://fonts.googleapis.com/css?family=Roboto"
        );

        headElement.appendChild(blipChatStartScreenStyleCss);
        headElement.appendChild(robotoFont);
        //fim

        //fala sobre as variáveis
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

        //busca do arquivo do css as classes que mostram ou não o bubble inicial
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
                self.chat.widget._openChat();//função específica do blip
            };

            //Criando o triangulo para parecer um balão
            var triangle = document.createElement("div");
            triangle.id = "triangle";

            //Inserindo a mensagem para o usuário
            var message = document.createElement("div");
            message.id = "message";
            message.innerHTML = self._bubbleMessage;

            self._bubble.appendChild(message);
            self._bubble.appendChild(triangle);
            self._bubbleContainer.appendChild(self._bubble);

            document
                .querySelector(`#${self._chatContainer}`)
                .prepend(self._bubbleContainer);//com o prepend a div 'bubble-container'
        };
        this.replaceImageStructure = function () {
            self._closeIcon = document.querySelector(`#${self._closeId}`); // _closeId = "blip-chat-close-icon" - X para fechar
            var oldImage = document.querySelector(`#${self._iconId}`); //_iconId = "blip-chat-icon" - O ícone base do blip

            var container = document.createElement("div");
            container.id = self._iconId;
            //com a classe top, ele fica com a imagem com opacty=1
            var img1 = document.createElement("img");
            img1.src = self._topImage;// img inicial(fica na frente)
            img1.classList.add("top");
            //com a classe top, ele fica com a imagem com opacty=0
            var img2 = document.createElement("img");
            img2.src = self._bottomImage;// img final(fica atrás)
            img2.classList.add("bottom");

            container.appendChild(img1);
            container.appendChild(img2);

            oldImage.parentElement.insertBefore(container, oldImage);
            oldImage.remove();
        };
        this.ToggleStartScreen = function (toHide) {
            var startScreen = document.getElementById("start-screen");//o menu principal
            var mainDiv = document.getElementById("blip-chat-start-screen");//o menu principal
            var chatOver = document.getElementById("blip-chat-button-over");//botão para voltar ao menu princiapl do chat blip

            if (mainDiv) {//se existir o menu
                if (toHide) {//parâmetro estiver lá
                    startScreen.classList.add("hide");//escondo o menu principal
                    mainDiv.classList.add("slide");//movo para esquerda(ele some) o menu principal
                    if (!self._blipChatLoadSuccessful) {//se o carregamento é false(diferente de true)
                        self._showMainDiv = true;
                    } else {
                        chatOver.classList.add("show");//mostrando o botão de voltar do menu
                    }
                } else {
                    startScreen.classList.remove("hide");//mostrnado (retirando o hide) 
                    chatOver.classList.remove("show");//tirando o botão de voltar
                    mainDiv.classList.remove("slide");//ele sai da esquerda e volta para o local normal
                }
            }
        };
        this.sendMessage = function (msg, contentType) {//envia mensagem
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

            if (self._chatConnected) {//se o chat estiver conectado,  habilitar encaminhamento de mensagem
                sendMessageFunction();
            } else {//se não inserir numa lista para mandar as mensagens
                self._messageSequence.push(sendMessageFunction);
            }

            self.ToggleStartScreen(true);//true não mostra o menu formulario e mostra o blipchat
        };
        this.processActionByElement = function (element) {
            if (!element.attributes || element.attributes.length === 0) {
                return 0;
            }
            var payload = element.getAttribute("payload");//olhar para o atributo payload

            if (payload) {//se o payload existir
                if (payload.indexOf(":") >= 0) {
                    var payloadItems = payload.split(":");
                    var selectorId = payloadItems[payloadItems.length - 1];
                    var message = document.getElementById(selectorId).value;//pegar o valor do elemento com payload
                    
                    console.log(selectorId)
                    if(selectorId =='question-input-recall'){
                        message = `meu cpf é ${message}` ;
                    }
                    if (message) {
                        
                        self.sendMessage(message, payloadItems[0]);//envia mensagem do payload
                    }
                } else {
                    self.sendMessage(payload, "click");
                }
                return 1;
            } else if (element.getAttribute("close-start-screen")) {
                self.toggleIframe(false);
                self.chat.widget._openChat();
                return 1;
            }
            return 0;
        };
        this.handler = function () {
            document.addEventListener("click", function (event) {
                if (event.srcElement) {//
                    if (self.processActionByElement(event.srcElement) === 1) {//só é um se houver um payload
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
                if (message.data.code === "ChatConnected") {//se estiver conectado
                    self._chatConnected = true;

                    if (!self._userIdentity && localStorage.getItem("blipSdkUAccount")) {//olhar para o lacalstorage para ver o id do histórico
                        var obj = JSON.parse(atob(localStorage.getItem("blipSdkUAccount")));
                        if (obj && obj.userIdentity) {
                            self._userIdentity = obj.userIdentity;
                        }
                    }

                    // if (self._userIdentity) {
                    //     while (self._trackSequence.length) {
                    //         var fnc = self._trackSequence.splice(0, 1)[0];
                    //         fnc();
                    //     }
                    // }

                    while (self._messageSequence.length) {//olhando para a lista de mensagens e ir mandando elas
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
                            // self.enqueueTrackFunction(self.trackCloseStartScreen);
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

                    // var scrollDownObj = document.getElementById("bottom-section");
                    // var toScrollDownObj = document.getElementsByClassName(
                    //     "start-screen-content"
                    // )[0];

                    // scrollDownObj.addEventListener("click", function (event) {
                    //     var lastScrollTopValue = 0;
                    //     var timer = setInterval(function () {
                    //         lastScrollTopValue = toScrollDownObj.scrollTop;
                    //         toScrollDownObj.scrollTop += 3;
                    //         if (toScrollDownObj.scrollTop <= lastScrollTopValue) {
                    //             clearInterval(timer);
                    //         }
                    //     }, 1);

                    //     scrollDownObj.classList.add(self._hideClassName);
                    // });

                    // toScrollDownObj.addEventListener("scroll", function (event) {
                    //     if (
                    //         toScrollDownObj.scrollHeight - toScrollDownObj.scrollTop <=
                    //         toScrollDownObj.getBoundingClientRect().height
                    //     ) {
                    //         scrollDownObj.classList.add(self._hideClassName);
                    //     }
                    // });

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
                .withEventHandler(BlipChat.CREATE_ACCOUNT_EVENT, function () {
                    self.chat.sendMessage(startMessage = {
                        type: "text/plain",
                        content: "MALWEE~|~form",
                        metadata: {
                            "#blip.hiddenMessage": true
                        }
                    });
                })
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

                    // self.enqueueTrackFunction(self.trackStartScreen);

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

    }

    document.addEventListener("DOMContentLoaded", function () {
        startScreen = new StartScreenWidget();
        startScreen.load();
        console.log('bot inicializado')
    });