# Utils

## Ngrok

---

### Para que serve
O Ngrok é uma ferramenta para temporariamente você expôr uma URL deixando exposta uma porta da sua máquina.

Ex:

- Criei uma aplicação e estou rodando na porta 5000 (localhost:5000)
- Preciso fazer com que alguém consiga fazer um teste nessa aplicação, porém está em localhost(na minha máquina)
- Para isso utilizo o Ngrok que irá criar uma url(http e https) através da porta 5000 (fazendo o bind dessa porta).
- Dessa forma será possível qualquer pessoa com acesso à internet acessar minha porta 5000.


### Como usar

1. Instale o ngrok:

- https://ngrok.com/
- se cadastre

2. Dentro da pasta onde foi instalado o Ngrok,conecte o seu authtoken(utilizando o terminal):
```bash
    ./ngrok authtoken SEUTOKEN
```


3. Após isso,suba sua aplicação (sendo que sua aplicação está rodando na porta 8080), e rode o seguinte comando dentro da pasta do ngrok:

```bash
    ./ngrok http 8080
```

4. Essa é a resposta provável(copie a url no navegador e estará disponível para utilizar em outros computadores/aplicação):

```

    ngrok by @inconshreveable                                       (Ctrl+C to quit)
                                                                                    
    Session Status                online                                            
    Account                       Will (Plan: Free)                                 
    Version                       2.3.35                                            
    Region                        United States (us)                                
    Web Interface                 http://127.0.0.1:4040                             
    Forwarding                    http://6c0a862a9e8e.ngrok.io -> http://localhost:5
    Forwarding                    https://6c0a862a9e8e.ngrok.io -> http://localhost:
                                                                                    
    Connections                   ttl     opn     rt1     rt5     p50     p90       
                                2       0       0.01    0.01    0.12    0.24      
                                                                                    
    HTTP Requests                                                                   
    -------------                                                                   
                                                                                    
    GET /favicon.ico               404 NOT FOUND                                    
    GET /                          200 OK   