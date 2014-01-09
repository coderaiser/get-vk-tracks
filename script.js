var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-26518084-1']);
_gaq.push(['_trackPageview']);

(function(){
    'use strict';
    
    var LogIn,
        AllInformation,
        Loading,
        Editor,
        Msg,
        AlwaysUpdate;
          
 
  $(document).ready(function(){
        Editor = ace.edit("editor");
        Editor.getSession().setMode("ace/mode/javascript");
        
        LogIn               = DOM.getById('login');
        Loading             = DOM.getByClass('icon')[0];
        Msg                 = DOM.getByClass('msg')[0];
        
        var lAllInformation = DOM.getById('allInformation'),
            lLinks          = DOM.getById('links'),
            lNames          = DOM.getById('names'),
            lLogOut          = DOM.getById('logout'),
            lAlwaysUpdate   = DOM.getById('alwaysUpdate');
        
        LogIn.onclick       = function(){
            var lProtocol = document.location.protocol;
            DOM.anyLoadInParallel([
                '//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/js/bootstrap.min.js',
                '//vkontakte.ru/js/api/openapi.js',
              ('https:' ===  lProtocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'
            ], function(){              
              VK.init({ apiId: 3336925 });
              VK.Auth.login(function(pResponse){
                onLogin(pResponse);
                lAllInformation.onclick();
            }, VK.access.AUDIO);
            });
        };
        
        lLogOut.onclick       = function(){
           $(lLogOut).button('toggle');
            showLoad();
            VK.Auth.logout(function(){
                hideLoad();
                AllInformation = '';
                Msg.textContent = '';
            });
            
            DOM.show( LogIn );
            DOM.hide( DOM.getByClass('btn-group')[0] );
            
            Editor.setValue('', -1);
        };
        
        
        lAllInformation.onclick = function(){
            showLoad();
            getAudio(function(){               
                var lAllInf = JSON.stringify(AllInformation, null, 4);
                Editor.setValue(lAllInf, -1);
                hideLoad();
            });
        };
        
        lLinks.onclick = function(){
            showLoad();
            getAudio(function(){
                var lUrls   =  parseInf(function(pTrack){
                    return pTrack.url + '\n';
                });                
                Editor.setValue(lUrls, -1);
                hideLoad();
            });
        };
        
        lNames.onclick = function(){
            showLoad();
            getAudio(function(){
                var lNames  = parseInf(function(pTrack){
                    return pTrack.artist + ' - ' + pTrack.title + '.mp3\n';
                });                
                Editor.setValue(lNames, -1);
                hideLoad();
            });
        };
      
      lAlwaysUpdate.onclick = function(){
            AlwaysUpdate = !AlwaysUpdate;
          }
  });
    
    function onLogin(response) {
        if (response.session) {
            DOM.show( DOM.getByClass('btn-group')[0] );
            DOM.hide( LogIn );
            
            console.log('user: ' + response.session.mid);
            VK.Api.call('getVariable', {key: 1281}, function(r) {
                if(r.response)
                    Msg.textContent = 'Привет, ' + r.response;
            });
            
            VK.Auth.getLoginStatus(function(pStatus){
                console.log(pStatus.connected);
            });
        }
    }
    
    function getAudio(pCallBack){
        var lFunc = function(){           
            Util.exec(pCallBack);
        };
        
         Util.ifExec(AllInformation && !AlwaysUpdate, lFunc, function(){
             VK.Api.call('audio.get', {}, getAudioTracks(pCallBack));
         });
    }
    
    function getAudioTracks(pCallBack){
        return function(pInformation) {
            console.log(pInformation);
            AllInformation  = pInformation.response;
            Util.exec(pCallBack);
            //var link        = window.URL.createObjectURL(new Blob([JSON.stringify(AllInformation)]));
            //createLink(link, "Вся информация");            
            //link = window.URL.createObjectURL(new Blob([lUrls]));
            //createLink(link, "Ссылки");
            
            //link = window.URL.createObjectURL(new Blob([lNames]));
            //createLink(link, "Имена песен");
        };
    }
    
    function createLink(pHref, pText){
        var lElement            = document.createElement('a');
        lElement.className      = 'btn btn-primary';
        lElement.textContent    = pText;
        lElement.href           = pHref;
    }
    
    function parseInf(pParseFunc){
        var lNames = '';
        
        for(var i = 0, n = AllInformation.length; i < n; i++)
            lNames += Util.exec(pParseFunc, AllInformation[i]);
        
        return lNames;
    }
    
    function showLoad(){
        DOM.addClass(Loading, 'loading');
    }
    
    function hideLoad(){
        DOM.removeClass(Loading, 'loading');
    }
    
})();