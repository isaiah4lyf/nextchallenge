'use strict'
var currentUrl = "";
$(document).bind('DOMSubtreeModified', function () {
    if(currentUrl !== window.location.href){
        console.log(window.location.href);
        currentUrl = window.location.href;
        //Preloader
        var preloader = $('#spinner-wrapper');
        $(window).on('load', function() {
            var preloaderFadeOutTime = 1000;

            function hidePreloader() {
                preloader.fadeOut(preloaderFadeOutTime);
            }
            hidePreloader();
        });

        jQuery(document).ready(function($) {

            //Incremental Coutner
            if ($.isFunction($.fn.incrementalCounter))
                $("#incremental-counter").incrementalCounter();

            //For Trigering CSS3 Animations on Scrolling
            if ($.isFunction($.fn.appear))
                $(".slideDown, .slideUp").appear();

            $(".slideDown, .slideUp").on('appear', function(event, $all_appeared_elements) {
                $($all_appeared_elements).addClass('appear');
            });

            //For Header Appearing in Homepage on Scrolling
            var lazy = $('#header.lazy-load')

            $(window).on('scroll', function() {
                if ($(this).scrollTop() > 200) {
                    lazy.addClass('visible');
                } else {
                    lazy.removeClass('visible');
                }
            });

            //Initiate Scroll Styling
            if ($.isFunction($.fn.scrollbar))
                $('.scrollbar-wrapper').scrollbar();

            if ($.isFunction($.fn.masonry)) {

                // fix masonry layout for chrome due to video elements were loaded after masonry layout population
                // we are refreshing masonry layout after all video metadata are fetched.
                var vElem = $('.img-wrapper video');
                var videoCount = vElem.length;
                var vLoaded = 0;

                vElem.each(function(index, elem) {

                    //console.log(elem, elem.readyState);

                    if (elem.readyState) {
                        vLoaded++;

                        if (count == vLoaded) {
                            $('.js-masonry').masonry('layout');
                        }

                        return;
                    }

                    $(elem).on('loadedmetadata', function() {
                        vLoaded++;
                        //console.log('vLoaded',vLoaded, this);
                        if (videoCount == vLoaded) {
                            $('.js-masonry').masonry('layout');
                        }
                    })
                });


                // fix masonry layout for chrome due to image elements were loaded after masonry layout population
                // we are refreshing masonry layout after all images are fetched.
                var $mElement = $('.img-wrapper img');
                var count = $mElement.length;
                var loaded = 0;

                $mElement.each(function(index, elem) {

                    if (elem.complete) {
                        loaded++;

                        if (count == loaded) {
                            $('.js-masonry').masonry('layout');
                        }

                        return;
                    }

                    $(elem).on('load', function() {
                        loaded++;
                        if (count == loaded) {
                            $('.js-masonry').masonry('layout');
                        }
                    })
                });

            } // end of `if masonry` checking


            //Fire Scroll and Resize Event
            $(window).trigger('scroll');
            $(window).trigger('resize');
        });

        /**
        * function for attaching sticky feature
        **/

        function attachSticky() {
            // Sticky Chat Block
            $('#chat-block').stick_in_parent({
                parent: '#page-contents',
                offset_top: 70
            });

            // Sticky Right Sidebar
            $('#sticky-sidebar').stick_in_parent({
                parent: '#page-contents',
                offset_top: 70
            });

        }

        function toggleFixed () {
            var parentwidth = $("#home-content").width();      
            $("#session-submit").css("width", parentwidth);      
        }

        // Disable Sticky Feature in Mobile
        $(window).on("resize", function() {
            toggleFixed(); 
            if ($.isFunction($.fn.stick_in_parent)) {
                // Check if Screen wWdth is Less Than or Equal to 992px, Disable Sticky Feature
                if ($(this).width() < 992) {
                    $('#chat-block').trigger('sticky_kit:detach');
                    $('#sticky-sidebar').trigger('sticky_kit:detach');

                    return;
                } else {

                    // Enabling Sticky Feature for Width Greater than 992px
                    attachSticky();
                }

                // Firing Sticky Recalculate on Screen Resize
                return function(e) {
                    return $(document.body).trigger("sticky_kit:recalc");
                };
            }
        });

        $(document).ready(function(){
        toggleFixed(); 
        $("#tab-dropdown-arrow-down-div").click(function(){

            if(document.getElementById("tab-dropdown-arrow-down-icon").src.includes("down-arrow")){
                $(".tab-dropdown-content").slideDown();
                document.getElementById("tab-dropdown-arrow-down-icon").src = "icons/up-arrow.svg";
            }else{
                $(".tab-dropdown-content").slideUp();
                document.getElementById("tab-dropdown-arrow-down-icon").src = "icons/down-arrow.svg";
            }
        });
        });
    }

});
