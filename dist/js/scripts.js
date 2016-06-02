/**
 * Syntaxy example scripts
 */
$(function()
{
    // look for some cookies
    var c_theme  = Cookies.get( '_theme' ),
        c_syntax = Cookies.get( '_syntax' ),
        c_type   = Cookies.get( '_type' );

    // setup bootstrap related stuff
    function setupBootstrap()
    {
        $( '[data-toggle="tooltip"]' ).tooltip();
        $( '[data-toggle="popover"]' ).popover();
    };

    // change syntaxy theme file
    function changeThemeFile( theme )
    {
        theme = theme || 'dark';
        document.getElementById( 'syntaxy-theme-hook' ).href = './dist/css/syntaxy.'+ theme +'.min.css';
        Cookies.set( '_theme', theme );
    };

    // get syntax data from file over AJAX
    function fetchSyntaxCode( syntax, type )
    {
        syntax = syntax || 'html';
        type   = type   || 'markup';

        var prebox  = $( '#syntaxy-code' ),
            request = $.ajax({

            method: "GET",
            url: "./dist/syntax/"+ syntax +".txt",
            dataType: "text",
            async: true,
            processData: false,
            crossDomain: false,
            cache: false,

            success: function( data, textStatus, jqXHR )
            {
                prebox.text( data.replace( /</g, '&lt;' ) ).syntaxy({
                    codeTitle  : syntax.toUpperCase() + " Syntax",
                    codeType   : type,
                    debugLines : ( syntax === 'html' ) ? '24' : '',
                });
                Cookies.set( '_syntax', syntax );
                Cookies.set( '_type', type );
            },
            error: function( jqXHR, textStatus, errorThrown )
            {
                prebox.html( "" +
                    "/** \n" +
                    " * There was a problem getting the syntax code to highlight from a file over AJAX. \n" +
                    " * Check the browser console for more details on the problem. \n" +
                    " * \n" +
                    " * Status code....: " + ( jqXHR.status || 'none' ) + " \n" +
                    " * Error info.....: " + ( errorThrown || textStatus || 'none' ) + " \n" +
                    " */ \n" )
                .syntaxy({
                    codeTitle  : 'Connection error',
                    codeType   : 'default',
                    debugLines : '6',
                });
            }
        });
    };

    // builds html related with dynamicly loaded contents
    function fetchTableData( id, file )
    {
        var target  = $( '#'+ id ),
            request = $.ajax({

            method: "GET",
            url: "./dist/json/"+ ( file || 'none' ) +".json",
            dataType: "json",
            async: true,
            processData: false,
            crossDomain: false,
            cache: true,

            success: function( data, textStatus, jqXHR )
            {
                if( data.head && data.list )
                {
                    var head = '',
                        body = '',
                        rows = '',
                        cols = '',
                        key;

                    for( key in data.head )
                    {
                        var align = ( key === 'description' ) ? 'right' : 'left';
                        head += '<td align="'+ align +'">'+ data.head[ key ] +'</td>';
                    };
                    data.list.forEach( function( item )
                    {
                        cols = '';

                        for( key in item )
                        {
                            if( key === 'description' )
                            {
                                cols += '' +
                                '<td align="right">'+
                                    '<button type="button" class="btn btn-xs btn-primary text-reset"' +
                                        'data-toggle="popover"' +
                                        'data-placement="left"' +
                                        'data-trigger="focus"' +
                                        'data-content="'+ item[ key ] +'">' +
                                        'Read' +
                                    '</button>' +
                                '</td>';
                            }
                            else{ cols += '<td class="text-code">'+ item[ key ] +'</td>'; }
                        }
                        rows += '<tr>' + cols + '</tr>';
                    });
                    target.html( '' +
                        '<thead>' + head + '</thead>' +
                        '<tbody>' + rows + '</tbody>'
                    );
                    setupBootstrap();
                }
            },
            error: function( jqXHR, textStatus, errorThrown )
            {
                target.html( '' +
                    '<tr>' +
                        '<td>' +
                            'Error loading data: '+ ( errorThrown || textStatus || 'unknown' ).toString() +
                        '</td>' +
                    '</tr>'
                );
            },
        });
    };

    // handle syntax change menu click
    $( 'a.examples' ).on( 'click', function( e )
    {
        e && e.preventDefault();

        var button = $( this ),
            type   = button.data( 'type' )   || '',
            syntax = button.data( 'syntax' ) || '';

        fetchSyntaxCode( syntax, type );
    });

    // handle theme color change events
    $( 'a.themes' ).on( 'click', function( e )
    {
        e && e.preventDefault();

        var button = $( this ),
            theme  = button.data( 'theme' ) || '';

        changeThemeFile( theme );
    });

    // handle scroll-to links
    $( '[data-scroll]' ).on( 'click', function( e )
    {
        e && e.preventDefault();

        var button = $( this ),
            target = button.data( 'scroll' ) || '',
            ypos   = parseInt( $( target ).offset().top || 0 );

        if( ypos > 0 )
        {
            $( 'html, body' ).stop().animate( { scrollTop: ypos }, 1000 );
        }
    });

    // load last syntax type, or default
    changeThemeFile( c_theme );
    fetchSyntaxCode( c_syntax, c_type );
    fetchTableData( 'options-tb', 'options' );
    fetchTableData( 'filters-tb', 'filters' );
    setupBootstrap();

    // init other syntaxy containers
    $( '.syntaxy' ).syntaxy();
});
