var i = 0;
var lS = new Object();
var Color = net.brehaut.Color;
var colorBox = {
  lighten : function(original_color,value){
    var my_color = Color(original_color);
    value -= 50;
    value = value/50;
    var finalColor = my_color.lightenByRatio(value).toCSS();
    return finalColor;
  },
  darken : function(original_color,value){
    var my_color = Color(original_color);
    value = 50 - value;
    value = value/50;
    var finalColor = my_color.darkenByRatio(value).toCSS();
    return finalColor;
  },
  saturate : function(original_color,value){
    var my_color = Color(original_color);
    value = (100-value)/100
    var finalColor = my_color.setSaturation(value).toCSS();
    return finalColor;
  },
  adjust_hue : function(original_color,value){

    var my_color = Color(original_color);
    value += 121.3;
    var finalColor = my_color.setHue(value).toCSS();
    return finalColor;
  }
}
$(function(){
  $.fn.getComputedVal = function(){ return $(this).attr('data-computed-value'); }

  var rules = $("#rules").val();
  rules = rules.split('_____');
  var strFields = "";

  $.each(rules,function(elemIndex,elemVal){

    var item = this;
    if (item != ''){

      // handling of metacomments titles as fieldset legends
      if (item.indexOf("/*--") != -1){
        if (elemIndex != 0){
          strFields += "</fieldset>";
        }
        strFields += "<fieldset><legend>"+rules[elemIndex+1]+"</legend>";
      }


      if ((item.indexOf("/**") != -1))
      {
        parseCommDesc(elemIndex,true);

      }

      if ((item.indexOf("$") != -1) && (item.indexOf(":") != -1)){
        item = item.split(":");
        var variable = item[0];//.replace('$','');
        var value = $.trim(item[1]);
        var display = (value.indexOf("/*@*/") == -1) ? 'block' : 'none';
        var valueComm = '';

        value = value.replace(";","");
        if ((value.indexOf("//") != -1)){
          value = value.split('//');
          valueComm = "<span class='tip help-block'>"+value[1]+"</span>";
          value = value[0];
        }
        window['lS'][$.trim(variable)] = $.trim(value);

        var computedValue = '';

        if (value.indexOf("$") != -1){
          computedValue = recursiveValueParser(value);
        }

        var iscol = ((value.indexOf("#") != -1) || (computedValue.indexOf("#") != -1)  ) ? 'class="colorpick"' : '';

        strFields += "<br/><div class='onefield' style='display:"+display+";'>";
        strFields += "<label for='"+variable.replace('$','')+"'>"+variable+"</label>";
        strFields += '<input type="text" data-computed-value="'+computedValue+'" name="'+variable+'" id="'+variable.replace('$','')+'" value="'+value+'" '+iscol+' />' + valueComm;
        strFields +="</div>";
      }

    }

  });

  $('.fields').append(strFields);

  $('.colorpick').each(function(){
    var colval = $(this).val();
    $(this).attr('data-color-original',colval);
    var func_stack = new Array();
    colval = (colval.indexOf("$") == -1) ? colval : $(this).getComputedVal();
    var $this = $(this);
    var realColor = colval;
    var saturAmount = 0;
    var lightAmount = 50;
    var hueAmount = 0;
    var pickerDisabled = false;
    var colorVariable = '';

    if( (colval.indexOf("lighten")!=-1) || (colval.indexOf("darken")!=-1) ||  (colval.indexOf("saturate")!=-1) || (colval.indexOf("adjust_hue")!=-1))
    {

      if ( ($(this).val().indexOf("$") != -1) && (($this.val().indexOf("lighten")!=-1) || ($this.val().indexOf("darken")!=-1) ||  ($this.val().indexOf("saturate")!=-1) || ($this.val().indexOf("adjust_hue")!=-1)))
      {
        var colorVariable = $this.val();
        colorVariable = colorVariable.split("(");
        colorVariable=colorVariable[1];
        colorVariable = colorVariable.split(",");
        colorVariable = colorVariable[0];
        colorVariable = $.trim(colorVariable);
        $this.attr('data-color-variable',colorVariable);
      }


      var colorRegex = /#(?:[0-9a-f]{3}){1,2}/i;

      amount = colval.split(",");
      amount = amount[1];
      amount = amount.replace(")",'');
      amount = $.trim(amount);

      pickerDisabled = true;


      if (colval.indexOf("lighten")!=-1)
      {
        func_stack.push('lighten');
        lightAmount = amount;
      }
      if (colval.indexOf("darken")!=-1)
      {
        func_stack.push('darken');
        lightAmount = amount;
      }
      if (colval.indexOf("saturate")!=-1)
      {
        func_stack.push('saturate');
        saturAmount = amount;
      }
      if (colval.indexOf("adjust_hue")!=-1)
      {
        func_stack.push('adjust_hue');
        hueAmount = amount;
      }





      realColor = colval.match(colorRegex);
      if (realColor)
      {
        realColor = realColor[0];
        $this.attr('data-color-current',realColor)
      }


      $.each(func_stack,function()
      {
        realColor = colorBox[this](realColor,amount);
        $this.attr('data-color-function',this).attr('data-color-amount',amount)
      });

      var sliderClone = $("#slider-box-template").clone();
      sliderClone.removeAttr('id').removeAttr('style');
      $this.parent().append(sliderClone);

      $this.parent().find('input[type="checkbox"]').prop('checked',false);
      $this.parent().find('.'+func_stack[0]).prop('checked',true);

    }


    $(this).spectrum({
      color: realColor,
      showInput: true,
      clickoutFiresChange: true,
      disabled:pickerDisabled
    });

    $this.parent().find('.lightbar')
      .noUiSlider({
         range: [0,100]
        ,start: [lightAmount]
        ,handles: 1
        ,connect: true
        ,step: 1
        ,serialization: {
           to: [$this.parent().find('.lighttxt')]
          ,resolution: 1
        }
      }).parent().change(function()
        {
          var amount = $(this).find('input[type="text"]').val();
          var toCall = amount>50?'lighten':'darken';

          var input = $(this).parent().parent().parent().find('.colorpick');
          var color = input.attr('data-color-current');
          var colvar = input.attr('data-color-variable');

          var cb = colorBox[toCall](color,amount);

          input.spectrum({
            color: cb,
            showInput: true,
            clickoutFiresChange: true,
            disabled:pickerDisabled
          }).show().val(toCall+"("+colvar+","+amount+")");
          $(this).parent().find('input[type="checkbox"]').prop('checked',false);
          $this.parent().find('.lighten').prop('checked',true);

        });

      $this.parent().find('.satbar')
        .noUiSlider({
           range: [0,100]
          ,start: [saturAmount]
          ,handles: 1
          ,connect: true
          ,step: 1
          ,serialization: {
             to: [$this.parent().find('.saturtxt')]
            ,resolution: 1
          }
        }).parent()
       .change(function()
         {
          var amount = $(this).find('input[type="text"]').val();
          var toCall = 'saturate';
          var input = $(this).parent().parent().parent().find('.colorpick');
          var color = input.attr('data-color-current');
          var colvar = input.attr('data-color-variable');

          var cb = colorBox[toCall](color,amount);

          input.spectrum({
            color: cb,
            showInput: true,
            clickoutFiresChange: true,
            disabled:pickerDisabled
          }).show().val(toCall+"("+colvar+","+amount+")");
          //    alert(color+" : "+cb);
          $(this).parent().find('input[type="checkbox"]').prop('checked',false);
          $this.parent().find('.saturate').prop('checked',true);


         });

        $this.parent().find('.huebar')
          .noUiSlider({
             range: [0,360]
            ,start: [hueAmount]
            ,handles: 1
            ,connect: true
            ,step: 1
            ,serialization: {
               to: [$this.parent().find('.huetxt')]
              ,resolution: 1
            }
          }).parent()
           .change(function()
           {
              var amount = $(this).find('input[type="text"]').val();
              var toCall = 'adjust_hue';
              var input = $(this).parent().parent().parent().find('.colorpick');
              var color = input.attr('data-color-current');
              var colvar = input.attr('data-color-variable');

              var cb = colorBox[toCall](color,amount);

              input.spectrum({
                color: cb,
                showInput: true,
                clickoutFiresChange: true,
                disabled:pickerDisabled
              }).show().val(toCall+"("+colvar+","+amount+")");
              $this.parent().find('input[type="checkbox"]').prop('checked',false);
              $this.parent().find('.adjust_hue').prop('checked',true);
           });

  }).show();

  $('.slideok').on('click',function(){
    $(this).parent().parent().slideUp();
    var inp = $(this).parent().parent().parent().parent().find('.colorpick');
    inp.change();
  })

  $('.slidecancel').on('click',function(){
    $(this).parent().parent().slideUp();
    var inp = $(this).parent().parent().parent().parent().find('.colorpick');
    inp.val(inp.attr('data-color-original'));

    var amount = inp.attr('data-color-amount');
    var toCall = inp.attr('data-color-function');

    var color = inp.attr('data-color-current');
    var cb = colorBox[toCall](color,amount);

    inp.spectrum({
                color: cb,
                showInput: true,
                clickoutFiresChange: true,
                disabled:true
              }).show()
  })

  $("#submitBtn").click(regenSCSS);

  $(".slider-box span.btn").click(function(){
    $(this).parent().find('.controls-container').slideToggle();

  });

  autoCompile();





  function parseCommDesc(nxt,begin){
    var next = rules[nxt]

    if (begin){
      strFields += "<ul class='desc' style='list-style:none'>";
    }
    if (next.indexOf("*/")!= -1){
      strFields += "</ul>";
      return;
    }
    if ((next.indexOf("*") != -1) && (next.indexOf("/*") == -1) && (next.indexOf("*/") == -1)) {
      next = next.replace("*", "");
      strFields += "<li>"+next+"</li>";
    }
    parseCommDesc(nxt+1, false);
  }

});

function regenSCSS(){
    var data = "";

    $('fieldset').each(function(){
      var $this = $(this);
      data += "/*------------------------------------*\\\n\r";
      data+= $this.find("legend").html()+"\n\r";
      data += "\\*------------------------------------*/\n\r";
      if ($this.find('.desc').length > 0){
        data += "/**\n\r";
        $this.find('.desc li').each(function(){
          data += '*'+$(this).text()+"\n\r";
        })
        data += "*/\n\r"
      }

      $this.find('.onefield').each(function(){
        data+= $(this).find("label").html() + ":";
        data+= $(this).find('input').val() + ";";
        console.log($(this).find("label").html() + ":" + $(this).find('input').val() + ";");
        if ($(this).find(".tip").length !=0){
          data+= "//"+$(this).find(".tip").html()+"\n\r";
        }
        data+= "\n\r";

      });

    });


  //  $("<pre>"+data+"</pre>").appendTo('body');
  loadingAnimation = setInterval(loadAnim, 100);

    $(".loading").fadeIn();
    $.post('/saveVars',data,function(r){
      setInterval(function(){
        clearInterval(loadingAnimation);
        $(".loading").fadeOut();
      }, 3000);
    })
}

function loadAnim() {
    i = ++i % 9;
    $(".ellipsis").html(Array(i+1).join("."));
}

function recursiveValueParser(val){

  if (val.indexOf("$") == -1){
 //   console.log(val);
    return val;
  }
  else{
    var position = val.indexOf("$");
    var val_section = val.substr(position);
    var variableName = val_section.split(' ');
    variableName = variableName[0];
    variableName = variableName.replace(',','');
    compValue = window['lS'][variableName];
    compValue = val.replace(variableName,compValue);
    return recursiveValueParser(compValue);
  }
}

function autoCompile(){
  $('.onefield > input').change(regenSCSS);
}



