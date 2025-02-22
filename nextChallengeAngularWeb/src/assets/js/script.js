"use strict";
var currentUrl = "";
$(document).bind("DOMSubtreeModified", function() {
  if (currentUrl !== window.location.href) {
    $("#gender").val("Gender");
    console.log(window.location.href);
    currentUrl = window.location.href;
    //Preloader
    var preloader = $("#spinner-wrapper");
    $(window).on("load", function() {
      var preloaderFadeOutTime = 1000;

      function hidePreloader() {
        preloader.fadeOut(preloaderFadeOutTime);
      }
      hidePreloader();
    });

    jQuery(document).ready(function($) {
      if (document.getElementById("profile-card") !== null)
        document.getElementById("profile-card").style.width =
          document.getElementById("chat-block").offsetWidth - 10 + "px";

      //Incremental Coutner
      if ($.isFunction($.fn.incrementalCounter))
        $("#incremental-counter").incrementalCounter();

      //For Trigering CSS3 Animations on Scrolling
      if ($.isFunction($.fn.appear)) $(".slideDown, .slideUp").appear();

      $(".slideDown, .slideUp").on("appear", function(
        event,
        $all_appeared_elements
      ) {
        $($all_appeared_elements).addClass("appear");
      });

      //For Header Appearing in Homepage on Scrolling
      var lazy = $("#header.lazy-load");

      $(window).on("scroll", function() {
        if ($(this).scrollTop() > 200) {
          lazy.addClass("visible");
        } else {
          lazy.removeClass("visible");
        }
      });

      //Initiate Scroll Styling
      if ($.isFunction($.fn.scrollbar)) $(".scrollbar-wrapper").scrollbar();

      if ($.isFunction($.fn.masonry)) {
        // fix masonry layout for chrome due to video elements were loaded after masonry layout population
        // we are refreshing masonry layout after all video metadata are fetched.
        var vElem = $(".img-wrapper video");
        var videoCount = vElem.length;
        var vLoaded = 0;

        vElem.each(function(index, elem) {
          //console.log(elem, elem.readyState);

          if (elem.readyState) {
            vLoaded++;

            if (count == vLoaded) {
              $(".js-masonry").masonry("layout");
            }

            return;
          }

          $(elem).on("loadedmetadata", function() {
            vLoaded++;
            //console.log('vLoaded',vLoaded, this);
            if (videoCount == vLoaded) {
              $(".js-masonry").masonry("layout");
            }
          });
        });

        // fix masonry layout for chrome due to image elements were loaded after masonry layout population
        // we are refreshing masonry layout after all images are fetched.
        var $mElement = $(".img-wrapper img");
        var count = $mElement.length;
        var loaded = 0;

        $mElement.each(function(index, elem) {
          if (elem.complete) {
            loaded++;

            if (count == loaded) {
              $(".js-masonry").masonry("layout");
            }

            return;
          }

          $(elem).on("load", function() {
            loaded++;
            if (count == loaded) {
              $(".js-masonry").masonry("layout");
            }
          });
        });
      } // end of `if masonry` checking

      //Fire Scroll and Resize Event
      $(window).trigger("scroll");
      $(window).trigger("resize");
    });

    /**
     * function for attaching sticky feature
     **/
    attachSticky();
    function attachSticky() {
      /*
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
            */
      //alert("hello");
    }

    function toggleFixed() {
      var parentwidth = $("#home-content").width();
      $("#session-submit").css("width", parentwidth);
    }

    function toggleFixedChatBar() {
      var parentwidth = $("#home-content").width();
      $("#open-chat-bar").css("width", parentwidth);
    }
    // Disable Sticky Feature in Mobile
    $(window).on("resize", function() {
      toggleFixed();
      toggleFixedChatBar();
      if (document.getElementById("profile-card") !== null)
        document.getElementById("profile-card").style.width =
          document.getElementById("chat-block").offsetWidth - 10 + "px";
    });

    $(document).ready(function() {
      toggleFixed();
      toggleFixedChatBar();
      $("#tab-dropdown-arrow-down-div").click(function() {
        if (
          document
            .getElementById("tab-dropdown-arrow-down-icon")
            .src.includes("down-arrow")
        ) {
          setTimeout(() => {
            $(".tab-dropdown-content").slideDown();
            document.getElementById("tab-dropdown-arrow-down-icon").src =
              "assets/icons/up-arrow.svg";
            setTimeout(() => {
              window.scrollTo(0, 0);
            }, 50);
          }, 50);
        } else {
          setTimeout(() => {
            $(".tab-dropdown-content").slideUp();
            document.getElementById("tab-dropdown-arrow-down-icon").src =
              "assets/icons/down-arrow.svg";
          }, 50);
        }
      });
    });
  }
});
