// 1. Imitates the way Trello works. Not exactly the same way though. But gives you an idea
// 2. Uses localStorage to put your data. https://github.com/jeromegn/Backbone.localStorage
// 
// Feel free to clone, critize or issue pull requests.
// Suggestions are welcome. Raise an issue and will reply back.

(function() {
   /*
    *   Helper function to access and use templates. 
    */
	window.template = function(id){
        return _.template($('#' + id).html());
    };


   /*
    *   Namespacing the Models, Collections, Views and Routes
    */
    window.App = {
        Models: {},
        Collections: {},
        Views: {},
        Routes: {}
    }; 


   /*
    *   A single Board
    */
    App.Models.Board = Backbone.Model.extend({
        defaults: {
            boardName: ''
        }
    });


   /*
    *   A collection of Boards
    */
    App.Collections.Boards = Backbone.Collection.extend({
        model: App.Models.Board
    });

   /*
    *   View definition for a single Board
    */
    App.Views.Board = Backbone.View.extend({
        tagName: 'li',

        template: template("BoardTemplate"),

        initialize:function(){
            // Custom events for the collections
            this.model.on('destroy', this.remove, this);
            this.model.on('change', this.render, this);
        },

        events: { // Events to be triggered when a board is called for editing or deleting
            'click .DeleteBoard': 'destroy',
            'click .EditBoard': 'edit'
        },

        render: function(){ // Render individual board.  
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        destroy: function(){ //When the model is reuqested to be removed from the collection. 
            var that = this;
            bootbox.confirm("Are you sure?", function(result) {
                if(result){
                    that.model.destroy(); //Destroy will remove only the model and trigger 'destroy' event.
                }
            }); 
        },
        remove: function(){ // When the model is 'destroy'ed an announcement is made to the view.  
            // custom events are triggered to remove the DOM from the UI. 
            this.$el.remove();
        },

        edit: function(){ 
            var that = this;
            bootbox.prompt("Editing Board Title", function(result) {
                if (result === null || result.length == 0) {
                    if(result.length == 0){
                        bootbox.alert("Hmm.. Cannot be empty!!", function() {
                            return false;
                        });
                    }
                    else{
                        bootbox.alert("Nothing updated!!", function() {
                            return false;
                        });   
                    }
                } else {
                    that.model.set({boardName: result});
                    that.model.save({boardName: result});
                }
            });
        }
    });


   /*
    *   View defnition for all Boards  
    */
    App.Views.Boards = Backbone.View.extend({
        tagName: 'ul',

        initialize: function(){
            this.collection.fetch(); // Get all the models , Boards, from ... Ugggg.. remember it's not from a remote server
            // but rather from localStorage. 
            this.collection.on('add', this.addBoard, this);
        },

        render: function(){
            this.collection.each(this.addBoard, this);
        },

        addBoard: function(board){
            var boardview = new App.Views.Board({model: board});
            this.$el.append(boardview.render().el);
        }

    });


   /*
    *   Lets' you add a Board to the collection and trigger events to render. 
    */
    App.Views.AddBoard = Backbone.View.extend({
        el: "#NewBoard",

        events: {
            'submit': 'submit'

        },
        initialize: function(){
        },

        submit: function(e){
            e.preventDefault(); //prevent form submit
            var newBoard = $(e.currentTarget).find('input[type=text]').val();
            var isexists = this.collection.where({ boardName: newBoard}).length?true:false;
            if(!isexists){
                var newBoardModel = new App.Models.Board({ boardName: newBoard});
                this.collection.add(newBoardModel);
                this.collection.invoke('save');
                $(e.currentTarget).parent().toggle();   
            }
            else {
                $(e.currentTarget).parent().toggle();   
            }
        }
    });

// Everything else remains same as that of Boards. Refer comments again and again for the Models, Collections and Views. 
// They all principally work the same way as Boards. 

   /*
    *   A single List
    */
    App.Models.List = Backbone.Model.extend({
        defaults: {
            boardName: '',
            listName: ''
        }
    });


   /*
    *   A collection of Lists
    */
    App.Collections.Lists = Backbone.Collection.extend({
        model: App.Models.List,

    });


   /*
    *   View definition for single List
    */
    App.Views.List = Backbone.View.extend({
        tagName: 'li',

        template: template("ListTemplate"),

        initialize: function(){
            this.model.on('destroy', this.remove, this);
            this.model.on('change', this.render, this);
        },

        events:{
            'click .DeleteList': 'destroy',
            'click .EditList': 'edit'
        },

        render: function(){
            var obj = this.model.toJSON();
            if(obj.boardName == window.location.hash.split("#")[1]){
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
            return null;
        },

        destroy: function(){
            var that = this;
            bootbox.confirm("Are you sure?", function(result) {
                if(result){
                    that.model.destroy();
                }
            }); 
        },
        remove: function(){
            this.$el.remove();
        },
        edit: function(){
            var that = this;
            bootbox.prompt("Editing List Title", function(result) {
                if (result === null || result.length == 0) {
                    if(result.length == 0){
                        bootbox.alert("Hmm.. Cannot be empty!!", function() {
                            return false;
                        });
                    }
                    else{
                        bootbox.alert("Nothing updated!!", function() {
                            return false;
                        });   
                    }
                } else {
                    that.model.set({listName: result});
                    that.model.save({listName: result});
                }
            });
        }

    });


   /*
    *   View definition for collection of Lists
    */
    App.Views.Lists = Backbone.View.extend({
        tagName: 'ul',

        initialize: function(){
            this.collection.fetch();
            this.collection.on('add', this.addList, this);

        },

        render: function(){
            this.collection.each(this.addList, this);
        },

        addList: function(list){
            var obj = list.toJSON();

            var boardview = new App.Views.List({model: list});
            if(boardview.render()){
                this.$el.append(boardview.el);
                $(".listpicker").append($("<option>"+obj.listName+ "</option>"));
            }
                
        }
    });

    App.Views.AddList = Backbone.View.extend({
        el: "#NewList",

        events: {
            'submit': 'submit'

        },
        initialize: function(){
        },

        submit: function(e){
            e.preventDefault();
            var newList = $(e.currentTarget).find('input[type=text]').val();
            var isexists = this.collection.where({ listName: newList}).length?true:false;
            if(!isexists){
                var newListModel = new App.Models.List({ boardName: window.location.hash.split("#")[1], listName: newList});
                this.collection.add(newListModel);
                this.collection.invoke('save');
                $(e.currentTarget).parent().toggle();   
            }
            else {
                $(e.currentTarget).parent().toggle();   
            }
        }
    });




   /*
    *   A single Card
    */
    App.Models.Card = Backbone.Model.extend({
        defaults: {
            boardName: '',
            listName: '',
            cardName: ''
        }
    });


   /*
    *   Collecion of Cards
    */
    App.Collections.Cards = Backbone.Collection.extend({
        model: App.Models.Card

    });


   /*
    *   View for a single Card
    */
    App.Views.Card = Backbone.View.extend({
        tagName: 'li',

        template: template("CardTemplate"),

        initialize: function(){
            this.model.on('destroy', this.remove, this);
            this.model.on('change', this.render, this);
        },

        events: {
            'click .DeleteCard': 'destroy',
            'click .EditCard': 'edit'
        },

        render: function(){
            var obj = this.model.toJSON();
            var str = window.location.hash.split("#")[1];
            str = str.split('/');
            if(obj.boardName == str[0] && obj.listName == str[1]){
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
            return null;
        },

        destroy: function(){
            var that = this;
            bootbox.confirm("Are you sure?", function(result) {
                if(result){
                    that.model.destroy();
                }
            }); 
        },
        remove: function(){
            this.$el.remove();
        },
        edit: function(){
            var that = this;
            bootbox.prompt("Editing Card Title", function(result) {
                if (result === null || result.length == 0) {
                    if(result.length == 0){
                        bootbox.alert("Hmm.. Cannot be empty!!", function() {
                            return false;
                        });
                    }
                    else{
                        bootbox.alert("Nothing updated!!", function() {
                            return false;
                        });   
                    }
                } else {
                    that.model.set({cardName: result});
                    that.model.save({cardName: result});
                }
            });
        }

    });


   /*
    *   View for collection of Cards
    */
    App.Views.Cards = Backbone.View.extend({
        tagName: 'ul',

        initialize: function(){
            this.collection.fetch();
            this.collection.on('add', this.addCard, this);
        },

        events: {
            'click .DeleteBoard': 'destroy'
        },

        render: function(){
            this.collection.each(this.addCard, this);
        },

        addCard: function(card){
            var cardview = new App.Views.Card({model: card});
            if(cardview.render())
                this.$el.append(cardview.el);
        }
    });


   /*
    *   Lets' you add a card to the list  
    */
    App.Views.AddCard = Backbone.View.extend({
        el: "#NewCard",

        events: {
            'submit': 'submit'

        },
        initialize: function(){
        },

        submit: function(e){
            e.preventDefault();
            var newCard = $(e.currentTarget).find('input[type=text]').val();
            var newList = $( ".listpicker option:selected" ).text();
            var isexists = this.collection.where({ cardName: newCard}).length?true:false;
            if(!isexists){
                var str = window.location.hash.split("#")[1];
                str = str.split('/');
                var newCardModel = new App.Models.Card({ boardName: str[0], listName: newList, cardName:newCard});
                this.collection.add(newCardModel);
                this.collection.invoke('save');
                $(e.currentTarget).parent().toggle();   
            }
            else {
                $(e.currentTarget).parent().toggle();   
            }
        }
    });


   /*
    *   Routes for the App. 
    */
    App.Routes = Backbone.Router.extend({
        routes: {
            '' : 'showboards',
            ':board': 'showlists',
            ':board/:list': 'showcards',

        },

        showboards: function(){
            $(".addboardform").hide();
            $(".addlistform").hide();
            $(".addcardform").hide();
            $(".addlist").hide();
            $(".addcard").hide();
            $(".addbroad").show();
            $(".listpicker").empty();
            $('.breadcrumb').html('<li><a href="#">Boards</a></li>');
            var boards = new App.Collections.Boards();
            boards.localStorage = new Backbone.LocalStorage('trello');
            var boardsView = new App.Views.Boards({collection: boards});
            boardsView.render();
            $('.page').html(boardsView.el);

            var addBoard = new App.Views.AddBoard({collection: boards});
        },

        showlists : function(board){
            $(".addboardform").hide();
            $(".addlistform").hide();
            $(".addcardform").hide();
            $(".addbroad").hide();
            $(".addcard").hide();
            $(".addlist").show();
            $(".addcard").hide();
            $('.breadcrumb').html('<li><a href="#">Boards</a></li>');
            $('.breadcrumb').append('<li><a href='+ window.location.hash +'>Lists - ' + board +' </a></li>');
            var lists = new App.Collections.Lists();
            lists.localStorage = new Backbone.LocalStorage('trello-list');
            var listsView = new App.Views.Lists({collection: lists});
            listsView.render();
            $('.page').html(listsView.el);

            var addList = new App.Views.AddList({collection: lists});
        },
        showcards: function(board, list){
            $(".addboardform").hide();
            $(".addlistform").hide();
            $(".addcardform").hide();
            $(".addbroad").hide();
            $(".addlist").hide();
            $(".addcard").show();
            $('.breadcrumb').html('<li><a href="#">Boards</a></li>');
            $('.breadcrumb').append('<li><a href='+ window.location.hash.split('/')[0] +'>Lists - ' + board +' </a></li>');
            $('.breadcrumb').append('<li class="active">Cards</li>');
            var cards = new App.Collections.Cards();
            cards.localStorage = new Backbone.LocalStorage('trello-cards');
            var cardsView = new App.Views.Cards({collection: cards});
            cardsView.render();
            $('.page').html(cardsView.el);
            var addCard = new App.Views.AddCard({collection: cards});
        }
    });


   /*
    *   Well, instantiate the Route object. 
    */
    var route = new App.Routes();
    Backbone.history.start();
    
})();
