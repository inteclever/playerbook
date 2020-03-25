<template>
    <div class="download-container">
        <div class="loader"> </div>
        <div id="sync-status"></div>
    </div>
</template>

<script>
import FileTransfer from '../../plugins/cordova-plugin-file-transfer/www/browser/FileTransfer';  
import axios from 'axios'

console.log(cordova.file);
var appDirectory =  "";
//const Downloader = require('../assets/downloader');
        
function getName(url){
    return url.substring(url.lastIndexOf('/')+1);
}

export default {
    data(){
        return{
            timingConfig       : require('../../timingConfig.json'),
            downloadLinksScope : [],
            countCheckVideoUp  : 0,
            syncStatus         : null,
            remoteConfig       : 'http://94.250.248.196:8000/api/V1/GetConfig',
        }
    },
    mounted(){
        this.syncStatus = document.querySelector('#sync-status');
        document.addEventListener("deviceready", 
            this.downloadInizialize
        , false);
    },
    beforeDestroy(){
        document.removeEventListener('deviceready', this.downloadInizialize)
    },
    methods:{
        /* 
         * main function start synchronization 
         * use on device ready cordova
         */
        downloadInizialize(){
            appDirectory = `${cordova.file.externalRootDirectory}/playerbook/`;
            
            let _tmpLinksScope     = this.timingConfig.playLists.map((item)=>{
                return {
                    'src'  : item.src,
                    'type' : item.type,
                    'title': item.title
                };
            });
            this.downloadLinksScope = Object.assign([...this.downloadLinksScope, ..._tmpLinksScope]);

            // collect adversts links
            _tmpLinksScope    = this.timingConfig.adverst.map((item)=>{
                return {
                    'src'  : item.src,
                    'type' : item.type,
                    'title': item.title
                };
            });

            this.downloadLinksScope = Object.assign([...this.downloadLinksScope, ..._tmpLinksScope]);
            // collect partners links
            _tmpLinksScope    = this.timingConfig.patners.map((item)=>{
                return {
                    'src'  : item.src,
                    'type' : item.type,
                    'title': item.title
                };
            });
            this.downloadLinksScope = Object.assign([...this.downloadLinksScope, ..._tmpLinksScope]);
            console.log(this.downloadLinksScope);
            /* --- End collect links. Main array for downloading: this.downloadLinksScope --- */

            /* check new config on server */
            let saveContextVue = this;
            
            const configRequest = axios.get(this.remoteConfig);
            configRequest.then((response)=>{
                response = response.data.config;
                console.log(response);
                window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir){
                    dir.getFile('timingConfig.json', { create: true }, (fileEntry)=>{
                        // if file exist
                        fileEntry.createWriter(function(writer){
                            // success create writer
                            writer.onwrite = function(evt) {
                                saveContextVue.listDir(appDirectory).then((entries)=>{saveContextVue.inPromiseListDir(entries);});
                            };
                            writer.write(JSON.stringify(response));
                        }, ()=>{
                            console.log('not wroten');
                            saveContextVue.listDir(appDirectory).then((entries)=>{saveContextVue.inPromiseListDir(entries);});
                        }); 
                    }, (error)=>{console.log(error);});
                });
            }).catch((error)=>{console.log(error);})
            

            
        }, 

        inPromiseListDir(entries){
            const linkScope = Object.values(entries);
            for(let index in this.downloadLinksScope){
                let configMovieName = getName(this.downloadLinksScope[index].src);
                if(!linkScope.includes(configMovieName) ){
        
                    let syncblock    = document.querySelector('#sync-status');
                    const _links     = this.downloadLinksScope;
                    const contextVue = this;
                    
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                        fileSystem.root.getFile(`/playerbook/${getName(_links[index].src)}`, 
                        { create: true }, function (targetFile) {

                            /* sTART DOWNLOAD FILE IN BACKGROUND MODE */
                            var downloader = new window.BackgroundTransfer.BackgroundDownloader();
                            console.log(`that: ${_links[index].src}`);
                            syncblock.innerHTML += `Проверяю видео: ${getName(_links[index].src)} <br/>`;
                            var download = downloader.createDownload(_links[index].src, targetFile);
                            // Start the download and persist the promise to be able to cancel the download.
                            app.downloadPromise = download.startAsync().then(
                                ()=>{ contextVue.endSynchron(true) }, 
                                ()=>{console.log('error backgrow download');},
                                ()=>{console.log('in progress')});
                            })
                    })
                }else{
                    this.syncStatus.innerHTML += `Видео: ${this.downloadLinksScope[index].title} - сущуствует <br/>`;
                    this.endSynchron(true);
                }
            }
        },






        /* NOT USELESS */
        downloadFile(url, title){
            let synctblock    = document.querySelector('#sync-status');
            const endSynchron = this.endSynchron;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
            function (fileEntry) {
                fileEntry.root.getDirectory("playerbook", {create: true}, function(){
                    var filepath = `${appDirectory}${getName(url)}`;
                    var fileTransfer = new FileTransfer();
                    fileTransfer.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            //console.log(`Downloaded: ${progressEvent.loaded / progressEvent.total}`);
                            //self.setPercentage(progressEvent.loaded / progressEvent.total);
                        } else {
                            //self.increment();
                        }
                    };
                    synctblock.innerHTML += `Проверяю видео: ${title} <br/>`;

                    fileTransfer.download(url, filepath,
                        function (fileEntry) {
                            console.log("download complete: " + fileEntry.toURL());
                            synctblock.innerHTML += `Видео: ${title} - сохранено <br/>`;
                            endSynchron(true);
                        },
                        function (error) {
                            synctblock.innerHTML += `Видео: ${title} - ошибка (проверьте сетевое подключение) <br/>`;
                            console.log("ErrorDownload: " + JSON.stringify(error));
                            endSynchron(true);
                        },
                        true,
                        {}
                    );

                });
            });
        },
        listDir(path){
            return new Promise((resolve, reject)=>{
                window.resolveLocalFileSystemURL(path,
                    function (fileSystem) {
                        var reader = fileSystem.createReader();
                        reader.readEntries(
                            function (entries) {
                                let _entries = entries.map((item)=>item.name);
                                console.log(_entries);
                                resolve(_entries);
                            },
                            function (err) {
                                reject(err);
                            }
                        );
                    }), function (err) {
                        console.log(err);
                    };
                }
            );
        }, 
        
        getName(url){
            return url.substring(url.lastIndexOf('/')+1);
        },
        downloadSuccessCallback() {
            // result is an object
            console.log("I'm returned");
        },
        downloadErrorCallback(error) {
            console.log(`Oshibochka ${error}`);
        },      
        /* --- */    
        endSynchron(videoUploadedCount){
            if (videoUploadedCount) this.countCheckVideoUp++;

            let countVideos = this.downloadLinksScope.length;
            console.log(`iteration: ${this.countCheckVideoUp} length: ${this.downloadLinksScope.length}`);
            if(this.countCheckVideoUp == countVideos){
                this.$emit('sync', true);
            }
        },

    }
}
</script>