/*
 * searchbox에서 검색어를 입력하면 자동완성 검색어 리스트를 레이어로 보여주는 jQuery Plugin
 * 작성자 : 최우진(zzznara@gmail.com)
 * 작성일 : 2016.09.20
 * 
 * # 파라미터
 * 	jsonData : ajax로 데이터를 호출하지 않고 jsonData에 값을 셋팅해서 사용
 *		ajaxUrl: ajax로 데이터 호출할 경우 호출 url
 *		codeObject: 자동완성 목록 중 선택된 데이타의 code값이 저장될 객체
 *		width: 자동완성 레이어의 너비값을 지정한다.
 *		left: 자동완성 레이어의 left 위치를 지정한다.
 *		top: 자동완성 레이어의 top 위치를 지정한다.
 *		maxListNum: 자동완성 레이어에 보여질 최대 목록수
 * 
 * # 사용예제 (json객체 사용일 경우)
 *		$("[name=contentsName]").moaAutoComplete({
 *				jsonObject: [{code: "1", text: "검색어1"}, {code: "2", text: "검색어2"}, {code: "3", text: "검색어3"}]
 *		});
 * 
 * # 사용예제 (ajax 호출일 경우)
 *		$("[name=contentsName]").moaAutoComplete({
 *				ajaxUrl: '/contents/listContentsActionAutoComplete',
 *				codeObject: $("[name=searchContentsSerialNumber]"),
 *				width: 314
 *		});
 */


jQuery(function($)
{
	$.fn.moaAutoComplete = function( options )
	{
			var $thisObj = this;
			var $parentObj = this.parent();
			var $layerObj;
			var layerId = "autoCompleteLayer";

			var _layout = "<ul class='ui-autocomplete ui-front ui-menu ui-widget ui-widget-content' id='ui-id-1' tabindex='0' style='display:none'>"
							  + "	<li class='ui-menu-item'>"
							  + "		<div id='ui-id-' tabindex='-1' class='ui-menu-item-wrapper' code='' text=''></div>"
							  + "	</li>"
							  + "</ul>"
							  ;

			/*
			  * 파라미터 셋팅
			  */
			var defaults = {
					
					/* jsonData */
					jsonData: null,
					
					/* ajax 호출 url */
					ajaxUrl: null,
					
					/* 선택된 code값이 저장될 객체 */
					codeObject: null,
					
					/* 자동완성 레이어의 너비 */
					width: null,
					
					/* 자동완성 레이어의 좌측 위치 */
					left: null,
					
					/* 자동완성 레이어의 우측 위치 */
					top: null,
					
					/* 자동완성 레이어에 보여질 최대목록수 */
					maxListNum: 10
			};
			
			var options = $.extend(defaults, options);

			/*
			  * 이벤트 함수
			  */
			var eventF = {

					  // searchBox에 검색어 입력시(keyup)
					  thisKeyup : function()
					 {
							$thisObj.keyup(function()
							{
									if( $.trim( $thisObj.val() ) == "" )
									{
											if( $layerObj.is(":visible") ) $layerObj.hide();
									}
									else
									{
											// 위/아래/탭/엔터/Esc 버튼이 아닐 경우
											if( event.keyCode != 38 &&
												event.keyCode != 40 &&
												event.keyCode != 9 &&
												event.keyCode != 13 &&
												event.keyCode != 27)
											{
													defaultF.viewLayerData();
											}
									}
							});
					 },

					  // searchBox에 마우스 클릭시
					  thisClick : function()
					 {
							$thisObj.click(function() {
									var availShow = true;

									if( options.codeObject ) {
											if( options.codeObject.attr("value") ) {
													if( options.codeObject.val() != "" ) {
															availShow = false;
													}
											}
									}

									if( $.trim( $thisObj.val() ) == "" ) {
										availShow = false;
									}

									if( availShow ) defaultF.viewLayerData();
									else {
										if( $layerObj.is(":visible") ) $layerObj.hide();
									}
							});
					 },

					  // searchBox의 값이 바뀌었을 때
					  thisChange : function()
					 {
							$thisObj.change(function() {
									if( options.codeObject ) {
											if( options.codeObject.attr("value") ) {
													options.codeObject.val("");
											}
									}
							});
					 },

					// 레이어에 이벤트 셋팅하기
					layerEvent : function()
					{
							$layerObj.children().each(function()
							{
									$(this).on("mouseover", function(){
										$(this).addClass("ui-state-active");
									});

									$(this).on("mouseout", function(){
										$(this).removeClass("ui-state-active");
									});

									$(this).on("click", function(){
										if( options.codeObject ) {
											if( options.codeObject.attr("value") ) {
												options.codeObject.val( $(this).find("div").attr("code") );
											}
										}										
										$thisObj.val( $(this).find("div").attr("text") );
										$layerObj.hide();
										$thisObj.focus();
									});

									$(this).on("keyup", function(){
										if( event.keyCode == 13 ) {
											if( options.codeObject ) {
												if( options.codeObject.attr("value") ) {
													options.codeObject.val( $(this).find("div").attr("code") );
												}
											}
											$thisObj.val( $(this).find("div").attr("text") );
											$layerObj.hide();
											$thisObj.focus();
										}
									});
							});
					},

					 // 자동완성레이어 외의 아무곳이나 클릭시 자동완성레이어 숨기기
					 documentMouseUp : function()
					{
							$(document).mouseup(function() {
								var outObj = true;

								var objLeft = $thisObj.offset().left - 6;
								var objRight = $thisObj.offset().left + $thisObj.width() + 6;
								var objTop = $thisObj.offset().top - 6;
								var objBottom = $thisObj.offset().top + $thisObj.height() + 6;
								
								if( event.clientX >= objLeft && event.clientX <= objRight && event.clientY >= objTop && event.clientY <= objBottom ) {
									outObj = false;
								}

								if( outObj ) {
									if( $layerObj.is(":visible") ) $layerObj.hide();
								}
							});
					},

					 // 위/아래/탭/엔터 버튼 클릭시 검색레이어 위아래로 이동하게 셋팅하기
					 documentKeyDown : function()
					{
							$( document ).on( "keydown", function()
							{
									if( $layerObj.is(":visible") )
									{
											var oldIndex = -1;
											var newIndex = -1;
											
											// 선택된 검색어의 index 가져오기
											$layerObj.children().each(function( index ){
												if( $(this).is(".ui-state-active") ) {
													oldIndex = index;
												}
											});

											// 엔터나 탭이나 오른쪽화살표일 경우
											if( event.keyCode == 13 || event.keyCode == 9 ) {
												if( oldIndex > -1 ) {
													$layerObj.children().eq( oldIndex ).trigger("click");
												}
											}
											// 위 화살표 클릭시
											if( event.keyCode == 38 ) {
												if( oldIndex == -1 || oldIndex == 0 ) {
													newIndex = $layerObj.children().length - 1;
												} else {
													newIndex = oldIndex - 1;
												}
											}
											// 아래 화살표 클릭시
											else if( event.keyCode == 40 ) {
												if( oldIndex == -1 || oldIndex == $layerObj.children().length - 1 ) {
													newIndex = 0;
												} else {
													newIndex = oldIndex + 1;
												}
											}

											if( oldIndex > -1 ) $layerObj.children().eq( oldIndex ).removeClass("ui-state-active");
											if( newIndex > -1 ) $layerObj.children().eq( newIndex ).addClass("ui-state-active");

											// Esc 버튼 클릭시
											if( event.keyCode == 27 ) {
												$layerObj.hide();
											}
									}
							});
					}
			};


			/*
			  * 일반 함수
			  */
			var defaultF = {

					// 레이어에 id 셋팅
					setLayerId : function()
					{
							layerId += $parentObj.find(".ui-autocomplete").length;
							$parentObj.find(".ui-autocomplete:last").attr("id", layerId);
							$layerObj = $parentObj.find("#"+ layerId);
					},
					
					// 레이어 위치 셋팅
					positionLayout : function()
					{
							$parentObj.css("position", "relative");
							$layerObj.css("position", "absolute");
							$layerObj.css("left", (options.left == null) ? 0 : options.left);
							$layerObj.css("top", (options.top == null) ? ($thisObj.height() + 9) : options.top );
							$layerObj.width( (options.width == null) ? $thisObj.width() : options.width );
					},

					// 배열로 데이타를 가져와서 레이어에 넣는다.
					getArrLayerData : function( jsonObj )
					{
							var str = "";
							var searchKeyword = $.trim( $thisObj.val() );

							if( jsonObj )
							{
									var jsonLength = jsonObj.length;
									for( var i = 0; i < jsonLength; i++ )
									{
											if( options.maxListNum ) {
												if( i > options.maxListNum ) {
													break;
												}
											}

											$obj = $( _layout ).clone();
											$obj.find("div").attr("code", jsonObj[i].code);
											$obj.find("div").attr("text", jsonObj[i].text);
											$obj.find("div").attr("id", $obj.find("div").attr("id") + i);
											$obj.find("div").html( jsonObj[i].text.replace(searchKeyword, "<font color=red><strong>"+ searchKeyword +"</strong></font>") );
											str += $obj.html();
									}

									$layerObj.empty().html( str );
									
									if( str ) {
										eventF.layerEvent();
										$layerObj.show();
									} else {
										$layerObj.hide();
									}
							}
					},

					// ajax로 데이타를 가져와서 레이어에 넣는다.
					getAjaxLayerData : function( callUrl )
					{
							var searchKeyword = $.trim( $thisObj.val() );

							if( searchKeyword != "" )
							{
									$.ajax({
									   type: 'POST',
									   url: callUrl,
									   data: "searchKeyword="+ searchKeyword,
									   dataType: "json",
									   success: function (jsonObj, status, xhr)
									   {
											defaultF.getArrLayerData( jsonObj );
									   }
									});
							}
					},

					// 넘어온 json 객체가 없으면 ajax 호출, 있으면 레이어에 출력한다.
					viewLayerData : function()
					{
							if( options.jsonData ) {
									defaultF.getArrLayerData( options.jsonData );
							} else {
									if( options.ajaxUrl ) defaultF.getAjaxLayerData( options.ajaxUrl );
							}
					}
			};


			/*
			  * 화면에 실제로 구현하는 부분
			  */
			return this.each( function() {

					// 이미 레이어가 있다면 삭제하자.
					if( $parentObj.find(".ui-autocomplete").length == 1 ) {
						$parentObj.find(".ui-autocomplete").remove();
					}
				
					// 레이어를 화면에 출력한다.
					$parentObj.append( _layout );
					defaultF.setLayerId();
					defaultF.positionLayout();

					// 이벤트 함수를 셋팅한다.
					eventF.thisKeyup();
					eventF.thisClick();
					eventF.thisChange();
					eventF.documentMouseUp();
					eventF.documentKeyDown();

			});
	}
});