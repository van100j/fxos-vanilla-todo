(function(window, document) {
    'use strict';
    
    var STORAGE_ID = 'todos-fxos-app',
        
		store = {
            get: function() {
                return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            },
            
            put: function(todos) {
                localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            }
        },
        
        showing = 'all', // show all, active or completed
        
        todos = store.get();
    
    /*
	todos -> array of todo objects:
    todos = [{
        id: ix,
        todo: String,
        completed: true/false 
    }, {
		...
	}]
    */
    
    /* 
     * get element by id, helper function
     */
    function $(id) {
        return document.getElementById(id);
    }
    
    /*
     * show todos: process and render todos
     */
    function showTodos() {
        var i, l,
            html = '';
        
		// process todos
        for(i = 0, l = todos.length; i < l; i++) {
            if(showing == 'all' || 
               (todos[i]['completed'] && showing == 'completed') || 
               (!todos[i]['completed'] && showing == 'active')) 
			{
                
                html += '<div class="todo-item ' + (todos[i]['completed'] ? 'completed' : '') + '" id="todo-holder-' + i + '">' + 

                            todos[i]['todo'] +

                            '<a href="#" class="remove" data-id="todo-' + i + '">&times;</a>' +

                            '<a href="#" class="complete" data-id="todo-' + i + '">&#x2713;</a>' +

                            '<form id="todo-edit-form-' + i + '">' +

                                '<input id="todo-edit-' + i + '" type="text" value="' + todos[i]['todo'] + '">' +

                            '</form>' +

                        '</div>';
            }
        }
        
		// render todos
        $('todos').innerHTML = html;
        
		// render toolbar
        $('toolbar').innerHTML = '<span id="total-items">' + todos.length + ' item' + (todos.length == 1 ? '' : 's') + '</span>' +
                                 '<a href="#"' + (showing == 'all' ? ' class="selected"' : '') + ' id="show-all">All</a>' +
                                 '<a href="#"' + (showing == 'active' ? ' class="selected"' : '') + ' id="show-active">Active</a>' +
                                 '<a href="#"' + (showing == 'completed' ? ' class="selected"' : '') + ' id="show-completed">Completed</a>';
        
        $('toolbar').style.display = todos.length ? 'block' : 'none';
        
    }
    
    /*
     * remove todo
     */
    $('todos').addEventListener('click', function(e) {
        e.preventDefault();
        
        var id,
            i, l,
            tds = [];
        
        if(e.target && e.target.nodeName == "A") {
            id = e.target.getAttribute('data-id').replace('todo-', '');
            
            if(e.target.classList.contains('remove')) {
                for(i = 0, l = todos.length; i < l; i++) {
                    if(i != id) {
                        tds.push( todos[i] );
                    }
                }
            } else { // complete
                for(i = 0, l = todos.length; i < l; i++) {
                    if(i == id) {
                        tds.push({
                            id: todos[i]['id'],
                            todo: todos[i]['todo'],
                            completed: !todos[i]['completed']
                        });
                    } else {
                         tds.push({
                            id: todos[i]['id'],
                            todo: todos[i]['todo'],
                            completed: todos[i]['completed']
                        });
                    }
                }
            }
            
            todos = tds;
            store.put( todos );
            showTodos();
        }
        
        // if click on input -> stop propagation
        if(e.target && e.target.nodeName == "INPUT") {
            e.stopPropagation();
        }
        
    });
    
    /*
     * start edit todo - show text input for todo
     */
    $('todos').addEventListener('dblclick', function(e) {
        var id;
        
        if(e.target && e.target.nodeName == "DIV") {
            id = e.target.getAttribute('id').replace('todo-holder-', '');
            
            $('todo-edit-' + id).classList.add('show');
        }
    });
    
    /*
     * end edit todo (change todo)
     */
    $('todos').addEventListener('submit', function(e) {
        var id,
            i, l,
            tds = [];
        
        e.preventDefault();
        
        if(e.target && e.target.nodeName == "FORM") {
            id = e.target.getAttribute('id').replace('todo-edit-form-', '');
            
            for(i = 0, l = todos.length; i < l; i++) {
                if(i == id) {
                    tds.push({
                        id: i,
                        todo: $('todo-edit-' + id).value,
                        completed: todos[i]['completed']
                    });
                } else {
                    tds.push( todos[i] );
                }
            }
            
            todos = tds;
            store.put( todos );
            showTodos();
            
            $('todo-edit-' + id).classList.remove('show');
        }
    });
    
    /*
     * end edit todo (focusout todo)
     */
    /*
    !!! Note: focusout not supported in FF, use 'blur' w/ useCapture -> true (below)
    $('todos').addEventListener('focusout', function(e) {
        
        var id,
            i, l,
            tds = [];
        
        if(e.target && e.target.nodeName == "INPUT") {
            id = e.target.getAttribute('id').replace('todo-edit-', '');
            
            for(i = 0, l = todos.length; i < l; i++) {
                if(i == id) {
                    tds.push( $('todo-edit-' + id).value );
                } else {
                    tds.push( todos[i] );
                }
            }
            
            todos = tds;
            store.put( todos );
            showTodos();
            
            $('todo-edit-' + id).classList.remove('show');
        }
        
    });
    */
    
    /*
     * end edit todo (on blur)
     */
    $('todos').addEventListener('blur', function(e) {
        
        var id,
            i, l,
            tds = [];
        
        if(e.target && e.target.nodeName == "INPUT") {
            id = e.target.getAttribute('id').replace('todo-edit-', '');
            
            for(i = 0, l = todos.length; i < l; i++) {
                if(i == id) {
                    tds.push({
                        id: i,
                        todo: $('todo-edit-' + id).value,
                        completed: todos[i]['completed']
                    });
                    
                } else {
                    tds.push( todos[i] );
                }
            }
            
            todos = tds;
            store.put( todos );
            showTodos();
            
            $('todo-edit-' + id).classList.remove('show');
        }
        
    }, true);
    
    /*
     * hide all todo inputs on click out of the input
     */
    document.addEventListener('click', function(e) {
        [].forEach.call(document.querySelectorAll('.todo-item input.show'), function(el){
            el.classList.remove('show');
        });
    });
    
    /*
     * add todo
     */
    $('todo-form').addEventListener('submit', function(e) {
        
        e.preventDefault();
        
        todos.push( {
            id: todos.length,
            todo: $('new-todo').value,
            completed: 0
        });
        
        store.put( todos );
        
        $('new-todo').value = '';
        
        showTodos();
        
    });
    
    /*
     * show all, active or completed
     */
    $('toolbar').addEventListener('click', function(e) {
        if(e.target && e.target.nodeName == "A") {
            showing = e.target.getAttribute('id').replace('show-', '');
            showTodos();
        }
    });
    
    
    showTodos();
    
})(this, this.document);