var dados = [];
var projecao = [];
var pastaAtiva = 0;
var louvorAtivo = 0;
var projecaoAtiva = 0;
var windowView;
var viewSlides = "";
var ref_selected = "0_0";
var tabActive;

var isFirefox = typeof InstallTrigger !== 'undefined';

function loadJSON(callback) {   
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'data/data.json', true); 
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == 200) {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);   
}

function carregaLouvores(){
  if(isFirefox){
    loadJSON(function(response) {

    atualizaListaArquivos(response);

    });    
  } else {
    $('#carregarModal').modal('toggle')
  }
  
}

$("#filedata").change(function() {
    var file = this.files[0];

    var reader = new FileReader();

    reader.onload = function(event) {
      var contents = event.target.result;
      atualizaListaArquivos(contents);
    }

    // when the file is read it triggers the onload event above.
    reader.readAsText(file);    
    $('#carregarModal').modal('toggle')
});

function atualizaListaArquivos(newData){
    dados = JSON.parse(newData);

    var songList = [];

    $('#listaDePastas').html("");

    $.each(dados, function(i, dado) {
      if(dado.type == "s"){
        songList.push({id: ""+i,text:dado.name,state:{opened: true},children:[]});
        $.each(dado.songs, function(f, louvor) {
            songList[i].children.push({id: i+"_"+f, text:louvor.title, type:"song", data:louvor});
        });        
      }

      $('#listaDePastas').append('<a class="dropdown-item" data-id="'+i+'">'+dado.name+'</a>');

    });

    $('#songList').jstree(true).settings.core.data = songList;
    $('#songList').jstree(true).refresh();

    $('#title').val(dados[0].songs[0].title);    
    $('#content').val(dados[0].songs[0].content);

    $('#listaDePastas > a').click(function(){
      console.log("Tentou criar música");

      var pastaSelecionada = parseInt($(this).attr("data-id"));

      dados[pastaSelecionada].songs.push({title: "", content: ""});

      lastAdded = dados[parseInt($(this).attr("data-id"))].songs.length - 1;

      ref_selected = pastaSelecionada+"_"+lastAdded;   

      atualizaListasFromJSON(dados);

      $('#guias a[href="#edit"]').tab('show');

    });

}

function atualizaListasFromJSON(newData){
    dados = newData;

    var songList = [];

    $('#listaDePastas').html("");

    $.each(dados, function(i, dado) {
      if(dado.type == "s"){
        songList.push({id: ""+i,text:dado.name,state:{opened: true},children:[]});
        $.each(dado.songs, function(f, louvor) {
            songList[i].children.push({id: i+"_"+f, text:louvor.title, type:"song", data:louvor});
        });        
      }

      $('#listaDePastas').append('<a class="dropdown-item" data-id="'+i+'">'+dado.name+'</a>');
    });

    $('#songList').jstree(true).settings.core.data = songList;
    $('#songList').jstree(true).refresh();

    $('#listaDePastas > a').click(function(){
      console.log("Tentou criar música");

      var pastaSelecionada = parseInt($(this).attr("data-id"));

      dados[pastaSelecionada].songs.push({title: "", content: ""});

      lastAdded = dados[parseInt($(this).attr("data-id"))].songs.length - 1;

      ref_selected = pastaSelecionada+"_"+lastAdded;   

      atualizaListasFromJSON(dados);

      $('#guias a[href="#edit"]').tab('show');

    });

    reloadProjectionList();
}

function reloadProjectionList(){
  if(projecao.length == 0){
    $("#no-projection-msg").show();
  } else {
    $("#no-projection-msg").hide();
  }
  $("#projections tbody").html("");
  $.each(projecao, function(i, item) {     
    if(item.type == "s") $('#projections tbody').append('<tr data-id="'+i+'"><td>'+dados[item.folderId].songs[item.id].title+'</td><td class="btn-mini"><button class="btn btn-danger btn-x">-</button></td></tr>');
    if(item.type == "b") {
      var label = bible[item.b].name+" "+(item.c+1)+":"+(item.from+1);
      if(item.from < item.to) label += "-" + (item.to+1);
      $('#projections tbody').append('<tr data-id="'+i+'"><td>'+label+'</td><td class="btn-mini"><button class="btn btn-danger btn-x">-</button></td></tr>');           
    }
  });  
  $(".btn-x").click(function(){
    var id = $(this).closest('tr').attr("data-id");
    projecao.splice(id, 1);
    reloadProjectionList();
  });
  generateLiveList(); 
}

$("#deleteFromTree").click(function(){
  var selecionado = $.jstree.reference('#songList').get_node($.jstree.reference('#songList').get_selected());
    if(selecionado.parent == "#"){
      $('#excluirModal').find('.modal-body p').html("Deseja realmente apagar a pasta <strong>"+selecionado.text+"</strong> e todo o seu conteúdo ?");
    } else {
      $('#excluirModal').find('.modal-body p').html("Deseja realmente apagar a música <strong>"+selecionado.text+"</strong> ?");
    }    
    $('#excluirModal').modal('toggle');
});

$("#newFolder").click(function(){   
    $('#makeFolderModal').modal('toggle');
    $('#folderName').val("");
});


$("#confirmMakeFolder").click(function(){   
    var name = $('#folderName').val();
    console.log("tentou criar pasta com o nome: "+name);
    dados.push({name: name, type: "s", songs: []});
    atualizaListasFromJSON(dados);
    $('#makeFolderModal').modal('toggle');
});


$("#confirmDeleteFromTree").click(function(){
  var selecionado = $.jstree.reference('#songList').get_node($.jstree.reference('#songList').get_selected());
    if(selecionado.parent == "#"){
      dados.splice(selecionado.id, 1);
    } else {
      dados[pastaAtiva].songs.splice(louvorAtivo, 1);
      ref_selected = "0_0";
    }
    atualizaListasFromJSON(dados);
    $('#title').val(dados[0].songs[0].title);    
    $('#content').val(dados[0].songs[0].content);
    $('#excluirModal').modal('toggle');   
});

$("#save").click(function(){
  dados[pastaAtiva].songs[louvorAtivo].title = $("#title").val();
  dados[pastaAtiva].songs[louvorAtivo].content = $("#content").val();
  atualizaListasFromJSON(dados);
  $("#msgSave").show();
});

$("#export").click(function(){
  console.log("Tentou exportar");
  // downloadObjectAsJson(louvores, "data");
  $("<a />", {
    "download": "data.json",
    "href" : "data:application/json," + encodeURIComponent(JSON.stringify(dados))
  }).appendTo("body")
  .click(function() {
     $(this).remove()
  })[0].click()  
});

$("#search").on("keyup", function() {
    var value = $(this).val();

    // Hide all table tbody rows
    $('#songs tbody tr').hide();

    // Searching text in columns and show match row
    $('#songs tbody tr td:contains("'+value+'")').each(function(){
     $(this).closest('tr').show();
    });  
});

// Case-insensitive searching (Note - remove the below script for Case sensitive search )
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
 return function( elem ) {
  return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
 };
});

// Gerar lista ao vivo
function generateLiveList(){
  $("#livesongs tbody").html("");      
  $('#livesongs tbody').append('<tr data-id="0"><td></td><td></td></tr>');
  var telaPadrao = "<section></section>\n";
  viewSlides=telaPadrao;
  var f = 1;
  $.each(projecao, function(i, item) {        
    if(item.type == "s"){
      var parsed = dados[item.folderId].songs[item.id].content.split('\n\n');
      $.each(parsed, function(j, estrofe) {        
        var estrofeEsp = estrofe.replace(/\n/g,"<br>");
        $('#livesongs tbody').append('<tr data-id="'+f+'"><td>'+dados[item.folderId].songs[item.id].title+'</td><td>'+estrofeEsp+'</td></tr>');
        // viewSlides+="<section data-background-transition=\"fade\" data-background=\"imagens/fundo.jpg\">\n<h2>"+estrofeEsp+"</h2>\n</section>\n";
        if(j == 0){
          viewSlides+="<section data-state=\"showtitle"+item.folderId+"_"+item.id+"\">\n<style>\n.showtitle"+item.folderId+"_"+item.id+" header.songtitle small:after{ content: \""+dados[item.folderId].songs[item.id].title+"\"; }\n.showtitle"+item.folderId+"_"+item.id+" header.songtitle{ display: table; }</style>\n";  
        } else {
          viewSlides+="<section>";
        }
        viewSlides+=estrofeEsp+"\n</section>\n";
        
        f++;
      });
      $('#livesongs tbody').append('<tr data-id="'+f+'"><td></td><td></td></tr>');
      f++;
      viewSlides+=telaPadrao;
    }
    if(item.type == "b"){
      for (var i = item.from; i <= item.to; i++) {
        var label = bible[item.b].name+" "+(item.c+1)+":"+(i+1);
        var scripture = bible[item.b].chapters[item.c][i];
        var refverse = "b"+item.b+"c"+item.c+"v"+i;
        $('#livesongs tbody').append('<tr data-id="'+f+'"><td>'+label+'</td><td>'+scripture+'</td></tr>');
        viewSlides+="<section data-state=\"scriptures "+refverse+"\">\n<style>\n."+refverse+" footer.scripturetitle small:after{ content: \""+label+"\"; }\n."+refverse+" footer.scripturetitle{ display: block; }\n</style>\n<p>"+scripture+"</p>\n</section>\n";
        f++;
      }
      $('#livesongs tbody').append('<tr data-id="'+f+'"><td></td><td></td></tr>');
      f++;
      viewSlides+=telaPadrao;      
    } 
  });

  $('#livesongs > tbody > tr').click(function() {    
    $( this ).parent().find( 'tr.active' ).removeClass( 'active' );
    $( this ).addClass( 'active' );
    projecaoAtiva = parseInt($(this).attr("data-id"));
    mudaSlide();
  });

  projecaoAtiva = 0;
  mudaProjecaoAtiva();

  updateViewSlides();
}

function updateViewSlides(){
  if (typeof(windowView)!='undefined' && !windowView.closed) {
    windowView.postMessage(JSON.stringify( {
          host: 'projection-html5',
          function: 'reloadReveal',
          url: window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search,
          data: viewSlides
        } ), "*");
  }
}

function mudaProjecaoAtiva(){
  $('#livesongs > tbody > tr.active').removeClass( 'active' );
  $('#livesongs > tbody > tr[data-id="'+projecaoAtiva+'"]').addClass( 'active' );
  $('#scrollblock').scrollTop(
      $('#livesongs > tbody > tr[data-id="'+projecaoAtiva+'"]').offset().top - $('#scrollblock').offset().top + $('#scrollblock').scrollTop()
  );   
  mudaSlide();
}

function mudaSlide(){
  if (typeof(windowView)!='undefined' && !windowView.closed) {
    windowView.postMessage(JSON.stringify( {
          host: 'projection-html5',
          function: 'changeSlide',
          url: window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search,
          data: projecaoAtiva
        } ), "*");    
  }  
}

$(document).on('keydown', function(e) {
    var rows = $('#livesongs > tbody > tr');
    var tag = e.target.tagName.toLowerCase();
    var tabName = $('#guias a[aria-selected="true"]').attr('aria-controls');

    if (tabName == "live" && tag != "input" && tag != "textarea" && tag != "a"){
       switch(e.keyCode) {
          case 37: // left
          {
            if(projecaoAtiva > 0){
              projecaoAtiva--;
              mudaProjecaoAtiva();
            }           
            break;
          }          
          break;

          case 38: // up
          {
            if(projecaoAtiva > 0){
              projecaoAtiva--;
              mudaProjecaoAtiva();
            }           
            break;
          }
          case 39: // right
          {
            if(rows.length > projecaoAtiva + 1){
              projecaoAtiva++;
              mudaProjecaoAtiva();
            }          
            break;  
          }          
          break;

          case 40: // down
          {
            if(rows.length > projecaoAtiva + 1){
              projecaoAtiva++;
              mudaProjecaoAtiva();
            }          
            break;  
          }
          default: return; // exit this handler for other keys
      }

      e.preventDefault(); // prevent the default action (scroll / move caret)     
    }

});

// Inicia a projeção
function startProjection() {      
  if (typeof(windowView) =='undefined' || windowView.closed || typeof(windowView) == null) {
    windowView = window.open("view.html", "_blank", "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,channelmode=yes, fullscreen=yes");
  }  
}
$('#startProjection').click(function(){
  startProjection();
});

window.onload = function() {
  carregaLouvores();
  // startProjection();
  reloadProjectionList();
};

$("#msgSave").hide();

$(function () { 
  $('#songList').jstree({ 'core' : {
      'data' : []
  },
  "types" : {
      "default" : {
        "icon" : "fas fa-folder-open fa-fw pt-2"
      },
      'f-open' : {
          'icon' : 'fas fa-folder-open fa-fw pt-2'
      },
      'f-closed' : {
          'icon' : 'fas fa-folder fa-fw pt-2'
      },
      "song" : {
        "icon" : "fas fa-file-alt fa-fw pt-2"
      }
    },
  "search":{
    "show_only_matches" : true,
    search_callback : function (str, node) {
      if(node.data != null){
        return node.text.toUpperCase().includes(str.toUpperCase()) || node.data.content.toUpperCase().includes(str.toUpperCase());
      } else {
        return node.text.toUpperCase().includes(str.toUpperCase());  
      }
    }    
  },
  "plugins" : [ "search", "types" ]
   });

  var to = false;
  $('#treesearch').keyup(function () {
    if(to) { clearTimeout(to); }
    to = setTimeout(function () {
      var v = $('#treesearch').val();
      $('#songList').jstree(true).search(v);
    }, 250);
  });

  /* Toggle between folder open and folder closed */
  $("#songList").on('open_node.jstree', function (event, data) {
      data.instance.set_type(data.node,'f-open');
  });
  $("#songList").on('close_node.jstree', function (event, data) {
      data.instance.set_type(data.node,'f-closed');
  });

  $('#songList').on("changed.jstree", function (e, data) {
    if(data.node != undefined && data.node != null && data.node.data != null){
        louvor = data.node.data;
        pastaAtiva = parseInt(data.node.id.split("_")[0]);      
        louvorAtivo = parseInt(data.node.id.split("_")[1]);      
        $('#title').val(louvor.title);    
        $('#content').val(louvor.content);
    }
  });

  $('#songList').bind("dblclick.jstree", function (e) {
      var instance = $.jstree.reference(this),
      node = instance.get_node(e.target);
     // Do my action
     if(node.data != null){
      var louvor = { id: louvorAtivo, folderId: pastaAtiva, type: "s" }
      projecao.push(louvor);
      reloadProjectionList();
     }
  });

  $('#songList').bind('refresh.jstree', function(e, data) {
        $('#songList').jstree(true).deselect_all();
        $('#songList').jstree(true).select_node(ref_selected);
  })


});

var ps = new PerfectScrollbar('#scrollblock');