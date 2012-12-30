	/**
	 * @name tagFeed
	 * Gets feed from its modules based on tags defined by the user. jQuery + UI Required.
	 *
	 * @author Ryoku Weil (w45p) | http://www.ryoku-weil.biz
	 * @version 27-12-2012
	 * 
	 * @param debug Bool Show debugging output on console. Defaults to False
	 * @param verbose Bool Show detailed step information on console. Defaults to False
	 *
	 */
	function tagFeed(params,debug,verbose) 
	{ 
		/*
		* Default params:
		*/
		this.defaultParams= {
				  container  : $('body')  		 // Where to render. Element pointer or jQuery Object.
				, style      : 'tagFeed'    	 // CSS Class Name Prefix. String.
				, autoLoad   : true   			 // Attempt to load cookie tags automatically? Boolean.
				, id    	 : 'autoTagFeed'	 // Custom ID for the frame element. String.
				, cookieName : 'tagFeedCookie'	 // Name for the cookie. String.
				, autoTag 	 : []				 // Default Tag values. Array.
		};
		/*
		* Feed Library  -> Name of classes.
		*/
		this.feedLib= {
				  HackerNews  : hnFeed
		};
		/*
		* Password for cookie encrypt/decrypt.  Not really important, used to avoid security issues with cookies.
		*/
		this.password = 'B4z1ng4!';
					

		/*
		 *	Initialize all vars.
		 */
		this.options=null;
		this.PNode=null;
		this.FNode=null;
		this.TNode=null;
		this.tagTxt=null;
		this.tagBtn=null;
		this.tagList=null;
		this.news=null;
		this.oops=null;
		this.sorted=new Object();
		this.qArr=new Array();
		this.shell=new Object();
		this.cookieVal='';
		
		/*
		 * ----> Debugging Functions START<----
		 * Private Methods error(message); warning(message); notice(message).
		 * Will only trigger if verbose/debug are set to true.
		 * -- Parameters: message.
		 */
		var verbose = typeof verbose !== 'undefined' ? verbose : false;
		var debug = typeof debug !== 'undefined' ? debug : false;
		/**
		 * Prints error messages in console. ONLY with debug mode enabled.
		 * @param (string) message
		 * @return
		 */
		var error = function(message){
			if(debug)
				console.log("-- tagFeed Class -FATAL ERROR- :: " + message);
			return;
		};
		/**
		 * Prints warning messages in console. ONLY with debug mode enabled.
		 * @param (string) message
		 * @return
		 */
		var warning = function(message){
			if(debug)
				console.log("-- tagFeed Class -WARNING- :: " + message);
			return;
		};
		/**
		 * Prints notice messages in console. ONLY with verbose mode enabled.
		 * @param (string) message
		 * @return
		 */
		var notice = function(message){
			if(verbose)
				console.log("-- tagFeed Class -NOTICE- :: " + message);
			return;
		};
		/*	----> Debugging Functions  END <----	*/
		 

		 /**
		 * Public Method fetchTags()
		 * Looks up tags in cookies.
		 * Looks up tags in body.
		 */
		this.fetchTags = function(){
			this.cookieVal= this.getCookie();
			if (this.cookieVal == null) {
				this.qArr=this.options.autoTag;
			} else {
				// do cookie exists stuff
				var temp="";
				temp = Aes.Ctr.decrypt(this.cookieVal, this.password, 256);
				this.qArr = temp.split(',');
			}
		};
		 
		 
		 /**
		 * Public Method setTags()
		 * Sets tags in cookies.
		 */
		this.setTags = function(){
			//fetch tags from txtbox, add them to qArr, set cookie.  Check for dups.
			// remove <  >  /  \  &  ? %  @ - ! 
			
			var tempArr = new Array(), temp="", spcChars=["<",">","/","\\","&","?","%","@","-","!"],x=0;
			temp=this.tagTxt.val().replace(/ /g, '+')
			temp= this.clearStr(temp,spcChars);
			tempArr = temp.split(',');
			//tempArr is clean and ready. Now add it to qArr.
			this.qArr=this.mergeArr(this.qArr.concat(tempArr));

			this.cookieVal = Aes.Ctr.encrypt(this.qArr.toString(), this.password, 256);
			this.setCookie();
			this.tagList.empty();
			for (var i=0 ; i < this.qArr.length ; i++){
				jQuery('<span>' + this.qArr[i] + '</span>', {
				}).appendTo(this.tagList);
			}
		};
		
		
		 /**
		 * Public Method mergeArr()
		 * Merges arrays without duplicating items.
		 */
		this.mergeArr = function(array) {
			var a = array.concat();
			for(var i=0; i<a.length; ++i) {
				for(var j=i+1; j<a.length; ++j) {
					if(a[i] === a[j])
					a.splice(j, 1);
				}
			}
			return a;
		};
		
		
		 /**
		 * Public Method clearStr()
		 * Removes a set of strings from a string.
		 */
		this.clearStr = function(str,arr){
			for (var i  in arr){
				str=str.replace(arr[i],"");
			}
			return str;
		};
		 
		 
		 /**
		 * Public Method getCookie()
		 */
		this.getCookie = function() {
			var name= this.options.cookieName;
			var dc = document.cookie;
			var prefix = name + "=";
			var begin = dc.indexOf("; " + prefix);
			if (begin == -1) {
				begin = dc.indexOf(prefix);
				if (begin != 0) return null;
			}
			else
			{
				begin += 2;
				var end = document.cookie.indexOf(";", begin);
				if (end == -1) {
				end = dc.length;
				}
			}
			return unescape(dc.substring(begin + prefix.length, end));
		} 
		
		
		/**
		 * Public Method setCookie()
		 */
		this.setCookie = function()
		{
			var exdate=new Date(), exdays=null;
			exdate.setDate(exdate.getDate() + exdays);
			var c_value=escape(this.cookieVal) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
			document.cookie=this.options.cookieName + "=" + c_value;
		}
		 
		 
		/**
		 * Public Method setPNode()
		 * Renders and sets parent node (PNode),
		 */
		this.setPNode = function(){
			if($("#" + this.options.id).length == 0) {
				jQuery('<div/>', {
					id: this.options.id
				}).appendTo(this.options.container);
				notice("Parent created: #" + this.options.id);
			};
			$("#" + this.options.id).empty()
			this.PNode=$("#" + this.options.id);
			notice("Parent Node Set.");
		};


		/**
		 * Public Method setFNode()
		 * Renders and sets frame node (FNode),
		 */
		this.setFNode = function(){
			if($("#fNode-" + this.options.id).length == 0) {
				jQuery('<div/>', {
					id: "fNode-" + this.options.id
				}).appendTo(this.PNode);
				notice("Frame created: #fNode-" + this.options.id);
			};
			$("#fNode-" + this.options.id).empty()
			this.FNode=$("#fNode-" + this.options.id);
			notice("Frame Node Set.");
		};


		/**
		 * Public Method setTNode()
		 * Renders and sets Tag node (TNode),
		 * and all it's elements. -> textBox, sendButton, listTags
		 */
		this.setTNode = function(){
			var _self=this;
			if($("#tNode-" + this.options.id).length == 0) {
				jQuery('<div/>', {
					id: "tNode-" + this.options.id
				}).appendTo(this.PNode);
				notice("Tag created: #tNode-" + this.options.id);
			};
			$("#tNode-" + this.options.id).empty()
			this.TNode=$("#tNode-" + this.options.id);
			notice("Tag Node Set.");
			//Setting contents.
			jQuery('<input/>', {
					id: "tagTxt-" + this.options.id,
					class: "tagTxt-" + this.options.id,
					type: "text"
			}).appendTo(this.TNode);
			this.tagTxt=$("#tagTxt-" + this.options.id);
			jQuery('<input/>', {
					id: "tagBtn-" + this.options.id,
					class: "tagBtn-" + this.options.id,
					type: "button",
					value: "+Tags"
			}).appendTo(this.TNode);
			this.tagBtn=$("#tagBtn-" + this.options.id);
			jQuery('<span/>', {
					id: "tagList-" + this.options.id,
					class: "tagList-" + this.options.id,
			}).appendTo(this.TNode);
			this.tagList=$("#tagList-" + this.options.id);
			//actions...
			this.tagBtn.click(function(){ _self.setTags(); });
		};

		
		/**
		 * Public Method fetchNews()
		 * Instanciates each module and fetches all news.
		 * Calls renderNews();
		 */
		this.fetchNews = function() {
			this.shell=new Object();
			this.news=new Object();
			var _self=this;
			//This watcher element will force syncronous behaviour.
					var watcher = jQuery('<div/>',{
						 id: "watcher",
						 style: "display:none"
					}).appendTo(this.PNode);
							
					watcher.change(function() {
						_self.renderNews();
					});			
			
			/* If Exists Load HN Feed Module */
			for(var i in this.feedLib){
				this.news[i]=new Array();
				if (typeof this.feedLib[i] === 'function'){
					notice("Fetching " + i + "...");
					this.shell[i]= new this.feedLib[i](this.qArr,true,true);
				}
			}
		};
		
		
		/**
		 * Public Method renderNews()
		 * Renders news or Error resulting from not finding data.
		 * Calls sortNews();
		 */
		this.renderNews = function() {
			this.news=new Object();
			
			for(var i in this.feedLib){
				this.news[i]=new Array();
				if (typeof this.feedLib[i] === 'function'){
					this.news[i].results=this.shell[i].results;
					this.news[i].hits=this.shell[i].hits;
				}
			}
		
			if(this.news==null){
				jQuery('<div class="' + this.options.stlye + ' error">Oops! We didn\'t find any results with your tags.</div>',{
				 id: "NOT"
				}).appendTo(this.PNode);
				notice("Feed is empty.");
				return
			}
			this.sortNews();
			for (var i in this.sorted){
				if(this.sorted[i].error==1){
					notice("No feeds were found at: " + this.sorted[i].source);
					jQuery('<div class="' + this.options.stlye + ' ' + this.sorted[i].source + ' empty">Sorry, no matching feeds were found at ' + this.sorted[i].source + '.<br> Try changing your tags.</div>', {
						id: this.sorted[i].source,
					}).appendTo(this.PNode);
				} else if(this.sorted[i].error==2){
					warning("An error was encountered at feed : " + this.sorted[i].source);
					jQuery('<div class="' + this.options.stlye + ' ' + this.sorted[i].source + ' error">Oops! ' + this.sorted[i].results + '.</div>', {
						id: this.sorted[i].source,
					}).appendTo(this.PNode);
				} else {
					jQuery('<div class="' + this.options.stlye + ' ' + this.sorted[i].source + '"><a target="_blank" href="' + this.sorted[i].url + '">' + this.sorted[i].title + '</a></div>', {
						id: this.sorted[i].source + '-' + this.sorted[i].id,
					}).appendTo(this.PNode);
				}
			}
		};
		
		
		/**
		 * Public Method sortNews()
		 * Sorts All news in a simple object for printing.
		 * This WILL be in charge of prioritizing entries from different feeds.
		 */
		this.sortNews = function(){
			this.sorted=new Object();
			for (var i in this.news){
				if(this.news[i].hits==0){
					this.sorted[i]=new Object()
					this.sorted[i].error=1;
					this.sorted[i].source=i;
				} else if(this.news[i].hits==-1){
					this.sorted[i]=new Object()
					this.sorted[i].error=2;
					this.sorted[i].source=i;
					this.message=this.news[i].results;
				} else {
					for (var j in this.news[i].results){
					this.sorted[i + "-" + j]=new Object();
						this.sorted[i + "-" + j]=this.news[i].results[j];
						this.sorted[i + "-" + j].error=0; 
						this.sorted[i + "-" + j].source=i;
					}
				}
			}
		}
				
		 
		/**
		 * Public Method checkParams()
		 * Validates parameters.
		 * Fixes misshapenings.
		 * @return true
		 */
		this.checkParams = function(){	
			if(typeof this.options.container == 'string'){
				this.options.container = $(this.options.container);
			} else if((this.options.container instanceof jQuery)===false){
				warning("container must be a string or a jQuery object. Resetting to default.");
				this.options.container=this.defaultParams.container;
				if(typeof this.options.container == 'string'){
					this.options.container = $(this.options.container);
				} else if((this.options.container instanceof jQuery)===false){
					warning("default container must be a string/jQuery Object. Setting to 'body'.");
					this.options.container=$('body');
				}
			}

			if (this.options.container.length <= 0)
				this.options.container.appendTo($('body'));
			
			if(typeof this.options.style != 'string'){
				warning("style must be a string. Resetting to default.");
				this.options.style=this.defaultParams.style;
				if(typeof this.options.style != 'string'){
					this.options.style='autoTagFeedclass';
					warning("default style must be a string. Setting to 'autoTagFeedclass'.");
				}
			}
				this.options.style = this.options.style.replace('.', '');
				this.options.style = this.options.style.replace('#', '');
			
			if(typeof this.options.id != 'string'){
				warning("id must be a string. Resetting to default.");
				this.options.id=this.defaultParams.id;
				if(typeof this.options.id != 'string'){
					this.options.id='autoTagFeedid';
					warning("default id must be a string. Setting to 'autoTagFeedid'.");
				}
			}
				this.options.id = this.options.id.replace('.', '');
				this.options.id = this.options.id.replace('#', '');
				
			if ($('#' + this.options.id).length > 0)
				warning("an element with the same id '" + this.options.id + "' already exists. Issues may arise.");
			
			if((this.options.autoTag instanceof Array)==false){
				this.options.autoTag=this.defaultParams.autoTag;
				warning("autoTag must be an array. Setting queries to Default.");
				if((this.options.autoTag instanceof Array)==false){
					warning("autoTag must be an array. Setting queries to empty.");
					this.options.autoTag=[];
				}
			}
			
			if(typeof this.options.cookieName != 'string'){
				warning("cookieName must be a string. Resetting to default.");
				this.options.cookieName=this.defaultParams.cookieName;
				if(typeof this.options.cookieName != 'string'){
					this.options.cookieName='autoTagFeedCookie';
					warning("default cookieName must be a string. Setting to 'autoTagFeedCookie'.");
				}
			}

			return true;
		};
		
		
		/**
		 * Public Method init()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.init = function() {
			notice("Initializing...");
			this.checkParams();
			this.setPNode();
			this.setTNode();
			this.setFNode();
			if(this.options.autoLoad){
				this.fetchTags();
				this.setTags();
			}
			this.fetchNews();
		};
		
		
		/*	
		 * 	Actually do stuff:
		 *	Check for integrity of received params and merge.
		 */
		 notice("Checking parameters...");
		if(typeof params !== 'object' && params !== null){
			warning("If Params are sent, they MUST be an Object-- Resetting to default.");
			params=this.defaultParams;
		}
		this.options = $.extend( {}, this.defaultParams, params);
		notice("User Params + Default Params merged.");
		
		// Initialize.
		this.init();	
	}