var ajax_object,
    cl=console.log,
    removeSpaceInBeginEnd = /^( |　|&nbsp;)*|( |　|&nbsp;)*$/g;
if (window.XMLHttpRequest) ajax_object = new XMLHttpRequest();
else {/*code for IE6, IE5*/ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}

// var query_result;
PRODUCT_ITEMS_queried = {
	product_items_array: [],


  PRODUCT_CONSTRUCTOR: function (
    product_id,
    admin_defined_id,
    full_name,
    unit, //is an array
    specification,
    amount,
    price_per_unit,
    total_sum,
    comment) {
    this.product_id = product_id;
    this.admin_defined_id = admin_defined_id;
    this.full_name = full_name;
    this.unit = unit;
    this.specification = specification;
    this.amount = amount;
    this.price_per_unit = price_per_unit;
    this.total_sum = total_sum;
    this.comment = comment;
}

};

var d_q=document.querySelector;

//这是单据内容的构造函数
function transaction_document_content(){
  var o = new Object();

  o = {
  "invoice_id": 1,
  "line_number": 1,
	"product_and_id": [id,admin_defined_id,full_name],
	"amount":/*decimal(9,2)*/1,
	"user_define_unit": ["","",""],
	"unit_coefficient": [1,4,40],
	"price_base_on_unit": 1,/*decimal(9,5)*/
	"product_income":1, /*decimal(10,2)*/
	"comment":1/* varchar(63)*/
};


}

//这是单据函数、多个单据数组的对象
var td = TRANSACTION_DOCUMENT = {

  //此处的id 与lists 中的id 
  //一一对应，用于查找对应的list
  //:creator
  "ids_in_document_lists":[],

  "queried_result_products":[],

  //文件列表指的是发票的列表，因为用户可能同时编辑多个发票
  //文件列表时一个数组，数组的元素是单独的发票
  //单个发票的构成：发票描述、发票内容
  "document_lists": {
    invoice_content_head_description_array: [
      [{t: "a",v:["name","line_number"]},{t: "i",v:"行号"}],
      [{t: "a",v:["name","product_id"]},{t: "i",v:"商品id"}],
      [{t: "a",v:["name","manufacturer"]},{t: "i",v:"厂家"}],
      [{t: "a",v:["name","full_name"]},{t: "i",v:"商品全名"}],
      [{t: "a",v:["name","admin_defined_unit"]},{t: "i",v:"规格"}],
      [{t: "a",v:["name","unit_1"]},{t: "i",v:"单位"}],
      [{t: "a",v:["name","amount_on_unit_1"]},{t: "i",v:"数量"}],
      [{t: "a",v:["name","price_base_on_unit"]},{t: "i",v:"单价"}],
      [{t: "a",v:["name","item_money_received"]},{t: "i",v:"金额"}],
      [{t: "a",v:["name","comment_for_item"]},{t: "i",v:"备注"}]
    ],


    "invoice_id1": {
        ////INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
      "trading_object": [1,"系统"],
      "doc_type" : "xs",//set('xs','jh','cg','db','dd'),销售，进货，草稿，调拨，用户订单
      "storehouse" : [1,"仓库1"],//[01,"仓库1"],
      "money_received" : 0,//Decimal(12,2),
      "comment" : '',//varchar(63)，描述区的备注
      "document_status" : "管理员编辑",  /*"成功", "管理员反冲", "管理员编辑", "用户提交（关）", "用户编辑", "用户开", "管理员取消", "用户取消"*/
      "document_created_time": "2016-11-21 11:46:15",
      
      // "document_description": 
      "document_content_array": [{
        "product_id": 123,
        "full_name": "小脆筒",
        "another_unit_factor": 0,//from another_unit
        "another_unit": "只",
        "un": "箱",//标注用户所选用的计算规格的方式
        "amount_on_unit_1": 0,
        "item_money_received": 0,
        "comment": ""
       },{
        "product_id":"",
        "manufacturer":"",
        "full_name":"",
        "admin_defined_unit":"",
        "unit_1":"",
        "amount_on_unit_1":"",
        "price_base_on_unit":"",
        "item_money_received":"",
        "comment_for_item":""
       }]
    }
  },

  //方法————单据对象的查看，查看之前需先保存当前显示的销售单
  // 1、获取当前invoice 的id
  // 2、注明当前的invoice type
  // 3、给部分表格（客户）添加事件监听器
  // 4、把新的id 写入表格描述部分
  // 5、更新发票对应的对象
  // 6、修改tab 状态
  "viewer": function(invoice_id){
    //当前视图如果存在单据,id=i，则先保存该单据
    var section = document.querySelector("#display_section");
    if(section.querySelector("#i")){
        td.saver(document.querySelector("td[name=invoice_id]").getAttribute("invoice_id"));
    }

    var doc_type_caption = document.querySelector("*[my_invoice_id='"+invoice_id+"']").querySelector("a").innerHTML.replace(/^(销售|进货).*/,"$1"+"单");
    section.innerHTML=[
      '<!-- i 表示invoice -->',
      '<table id="i" class="table table-bordered col-md-12" >',
      '<caption class="text-center lead">'+doc_type_caption+'</caption>',
      '<!-- i_des 表示invoice_description-->',
      '<thead id="i_des">',
      '<tr>',
      '<td colspan=2>往来单位：</td>',
      '<td name="trading_object" colspan="3" contenteditable></td>',
      '<td name="invoice_id" invoice_id="'+invoice_id+'">单据编号：</td>',
      '<td name="generated_id" colspan="1"></td>',
      '<td>制单时间：</td> <td name="document_created_time" ></td>',
      '</tr>',
      '<tr>',
      '<td colspan=2>仓库：</td>',
      '<td name="store_house" colspan="3"></td>',
      '<td>备注：</td>',
      '<td name="comment" colspan="3" contenteditable></td>',
      '</tr>',
      '</thead>',
      '<!-- i_c表示invoice content -->',

      '<tbody id="i_c">',
      '</tbody>',

      '<tfoot>',
      '<tr>',
      '<td>合计</td>',
      '<td colspan=3 name="money_received_chinese"></td>',
      '<td >数量</td>',
      '<td name="total_amount"></td>',
      '<td>金额</td>',
      '<td colspan=2 name="money_received"></td>',
      '</tr>',
    ].join("\n");

    var ls_fucntion_tab = $([
      '<div id="ls_fucntion_tab" class="">',


      '<button id="print_invoice" class="btn btn-default"><a href="#">打印单据</a></button>',
      '<button id="save_as_draft" class="btn btn-default"><a href="#">存为草稿</a></button>',
      '<button id="invoice_to_db" class="btn btn-default"><a href="#">单据过账</a></button>',


      '</div>'
      ].join("\n")
      );

    ls_fucntion_tab.find("#print_invoice").on("click", function(){window.print();});

    $(section).append(ls_fucntion_tab);

    document.querySelector("td[name='trading_object']").addEventListener("keypress", td.query_people);

    var des = document.querySelector('#i_des');
    des.querySelector('td[name="invoice_id"]').invoice_id = invoice_id;

    //获取对应的对象文件
    var a = td.document_lists["invoice_id"+invoice_id];
    //从对象文件中读取描述和数据
    //展示往来单位
    var des_td = des.querySelector("td[name='trading_object']");
    des_td.addEventListener("click",td.builder.cell_checker);
    if(a.trading_object[1])
      des_td.innerHTML = a.trading_object[1];
    else
      des_td.innerHTML ="";

    //展示单据描述数据
    des.querySelector('td[name="generated_id"]').innerHTML = a.doc_type+"-"+invoice_id;
    des.querySelector('td[name="document_created_time"]').innerHTML = a.document_created_time;
    des.querySelector('td[name="store_house"]').innerHTML = a.storehouse[1];
    var des_comment = des.querySelector('td[name="comment"]');
    des_comment.innerHTML = a.comment;
    des_comment.addEventListener("click",td.builder.cell_checker);
    des_comment.addEventListener("blur",function(){
      a.comment = this.innerHTML;  
    });
    if(a.money_received)
    document.querySelector('td[name="money_received"]').innerHTML = a.money_received;


    var c = document.querySelector('#i_c');
    var table_head_fields_description_array = td.document_lists.invoice_content_head_description_array;
    //初始化表格头
    c.appendChild(td.builder.new_line_creat("th",table_head_fields_description_array));

    for (var i = 0; i < a.document_content_array.length; i++) {
      c.appendChild(td.builder.new_line_creat_from_o_and_thead(a.document_content_array[i],table_head_fields_description_array));
    };

    //last line
    var last_line = td.builder.new_line_creat_from_o_and_thead("td",table_head_fields_description_array);
    var full_name_td = last_line.querySelector("[name='full_name']");
    full_name_td.removeEventListener("blur", td.builder.cell_checker);
    c.appendChild(last_line);

    for (var i = 1; i < c.childNodes.length; i++) {
      c.childNodes[i].querySelector('[name="full_name"]').addEventListener("keypress",td.builder.query_products);
    }

    td.builder.line_number_refresher(c);
    td.builder.sum_refresher();
  },

  "saver": function(id){
    var a = document.querySelector("#i_c").querySelectorAll("tr");
    var d_a=td.document_lists["invoice_id"+id].document_content_array;
    d_a.splice(0,d_a.length);// 思考为什么不能用d_a=[];
    for (var i = 1; i < a.length-1; i++) {
      var o = {
      "product_id": Number(a[i].querySelector('*[name="product_id"]').innerHTML),
      "manufacturer": a[i].querySelector('*[name="manufacturer"]').innerHTML,
      "full_name": a[i].querySelector('*[name="full_name"]').innerHTML,
      "admin_defined_unit": Number(a[i].querySelector('*[name="admin_defined_unit"]')),
      "unit_1": "箱",//标注用户所选用的计算规格的方式
      "price_base_on_unit": Number(a[i].querySelector('*[name="price_base_on_unit"]').innerHTML),
      "amount_on_unit_1": Number(a[i].querySelector('*[name="amount_on_unit_1"]').innerHTML),
      "item_money_received": Number(a[i].querySelector('*[name="item_money_received"]').innerHTML),
      "comment_for_item": a[i].querySelector('*[name="comment_for_item"]').innerHTML
      };

      d_a.push(o);

    }


  },


  //方法————单据对象的创建
  //在主数据库创建一个单据，主数据库返回单据id
  "creator": function (doc_type){
    var c_new_i,
        doc_type_Chinese;

    if(doc_type=="xs") {
      doc_type_Chinese="销售给某单位";

    }
    if(doc_type=="jh") {
      doc_type_Chinese="进货从某单位";

    }

    (function query(string){
      var ajax_object;
      if (window.XMLHttpRequest) ajax_object = new XMLHttpRequest();
      else {/*code for IE6, IE5*/ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}

      ajax_object.onreadystatechange = function(){
        if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200){

          var ajax_result = JSON.parse(ajax_object.response);
          c_new_i = ajax_result.id;

          var invoice = "invoice_id"+c_new_i;
          td.document_lists[invoice] = {
            "trading_object": [0,""],
            "doc_type" : doc_type,
            "storehouse" : [1,"仓库1"],
            "money_received" : 0,
            "comment" : "",
            "document_status" : "管理员编辑", 
            "document_created_time": ajax_result.created_time,

            "document_content_array": []
          };
          var a = document.createElement("li");
          //a 指的是tab中的li元素
          a.innerHTML="<a href='#'>"+doc_type_Chinese+"</a>";
          document.querySelector("#documents_tab>ul").appendChild(a);
          

          a.setAttribute("my_invoice_id",c_new_i);
          a.setAttribute("tab_content","invoice");
          a.addEventListener("click",function(){ td.viewer(this.getAttribute("my_invoice_id")); });
          a.addEventListener("click",ls.checker.status.tab_active_check);
          ls.checker.status.tab_active_check.call(a);

          //创建并添加到视图
          td.viewer(c_new_i);
        }
        if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status == 404){
          alert("数据库连接错误");
        }
      };
      ajax_object.open("GET", "query.php?" + string, true);
      ajax_object.send();
      })//此处传入的c_new_i是字符串，php发现此标记后，进行新发票的创建，返回新发票id
    ("c_new_i=1&doc_type="+doc_type);
  },

  "creator_xs": function(){
    td.creator("xs");
  },

  "creator_jh": function(){
    td.creator("jh");
  },
  /*
  如果该方法由viewer 唤起，则为相应td 元素添加事件处理器；
  如果该方法用于创建表格列表，则
    使用字符串或者py_code来检索商品，陈列商品，为列表添加时间处理器
    当用户选中某几个条目时，将条目写入发票中，写入td的lists 中
  */
  "builder": {
    new_line_creat: function(tag_name_within_line_tr, fields_description_array){
      var tr=document.createElement("tr");
      for (var i = 0; i < fields_description_array.length; i++) {
        tr.appendChild(td.builder.new_element_creat(tag_name_within_line_tr, fields_description_array[i]));
      };
      return tr;

    },

    new_element_creat: function(tag_name, field_description_array){
      var element = document.createElement(tag_name);
      for (var i = 0; i < field_description_array.length; i++) {
        switch(field_description_array[i].t){
          case "a":
              element.setAttribute(field_description_array[i].v[0],field_description_array[i].v[1]);
              break;
          case "i":
              element.innerHTML = field_description_array[i].v;
              break;
          case "e":
              element.addEventListener(field_description_array[i].v[0],field_description_array[i].v[1]);
              break;
        }
      };
      return element;
    },

    new_line_creat_from_o_and_thead: function (a, table_head_fields_description_array){//a是document_content_array的item
      var tr_fileds_description=[]
      for (var i = 0; i < table_head_fields_description_array.length; i++) {
        tr_fileds_description[i] = [table_head_fields_description_array[i][0]];
      };

      for (var i = 0; i < tr_fileds_description.length; i++) {
        //innerHTML
        var td_des = tr_fileds_description[i];
        if(a[tr_fileds_description[i][0]["v"][1]])
        tr_fileds_description[i].push({t:"i",v:a[tr_fileds_description[i][0]["v"][1]]});

        switch(tr_fileds_description[i][0]["v"][1]){
          case "line_number":
              break;
          case "product_id":
              break;
          case "manufacturer":
              break;
          case "full_name":
              td_des.push(
                {t:"e",v:["name","line_number"]},
                {t:"e",v:["keypress",td.builder.query_products]},
                {t:"e",v:["blur", td.builder.cell_checker]},
                {t:"e",v:["click", td.builder.cell_checker]},
                {t:"e",v:["keydown", ls.edit.arrow_key_control]},
                {t:"e",v:["click", 
                  function(){
                    $("[input_end_point]").removeAttr("input_end_point");
                    $(this).parent().attr("input_end_point","");
                  }
                  ]},
                {t:"a", v:["placeholder",a.full_name]},//用于checker
                {t:"a", v:["contenteditable","true"]}
                );
              break;
          case "admin_defined_unit":
              break;
          case "unit_1":
              break;
          case "amount_on_unit_1":
              td_des.push(
                {t:"e",v:["click", td.builder.cell_checker]},
                {t:"e",v:["blur",td.builder.number_check_after_input]},
                {t:"e",v:["blur",td.builder.amount_or_price_affect_received]},
                {t:"e",v:["keydown", ls.edit.arrow_key_control]},
                {t:"e",v:["keypress", td.builder.number_check_when_input]},
                {t:"a",v:["contenteditable","true"]}

              );
              break;
          case "price_base_on_unit":
              td_des.push(
                {t:"e",v:["click", td.builder.cell_checker]},
                {t:"e",v:["blur",td.builder.number_check_after_input]},
                {t:"e",v:["blur",td.builder.amount_or_price_affect_received]},
                {t:"e",v:["keydown", ls.edit.arrow_key_control]},
                {t:"e",v:["keypress", td.builder.number_check_when_input]},
                {t:"a",v:["contenteditable","true"]}
              );
              break;
          case "item_money_received":
              td_des.push(
                {t:"e",v:["click", td.builder.cell_checker]},
                {t:"e",v:["blur",td.builder.number_check_after_input]},
                {t:"e",v:["keydown", ls.edit.arrow_key_control]},
                {t:"e",v:["keypress", td.builder.number_check_when_input]},
                {t:"e",v:["blur",td.builder.receive_affects_price]},
                {t:"a",v:["contenteditable","true"]}
              );
              break;
          case "comment_for_item":
              td_des.push(
                {t:"e",v:["click", td.builder.cell_checker]},
                {t:"e",v:["keydown", ls.edit.arrow_key_control]},
                {t:"a",v:["contenteditable","true"]}
              )
              break;
        }
      };

      //tr created
      return td.builder.new_line_creat("td",tr_fileds_description);
    },

    // 两个功能，如果是click和focus，则选中表格内容
    // 如果是blur，则检查输入结果是否为空
    "cell_checker": function(e){
      //点击后自动选择表格内容，用于td
      if(e.type=="click" || e.type=="focus"){
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(this);
            range.select();
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNodeContents(this);
            window.getSelection().addRange(range);
        } 
      }

      if(e.type=="blur"){
          // console.log(this.innerHTML.replace(/ /g,"").replace(/　/g,""));
        if(this.innerHTML.replace(removeSpaceInBeginEnd,"")==""){//正则表达式
          console.log(this.parentNode);
          td.builder.line_deleter(this.parentNode);
        }else 
        if(this.hasAttribute("placeholder") && this.innerHTML != this.getAttribute("placeholder"))
          this.innerHTML=this.getAttribute("placeholder");
      }
    },

    "line_deleter": function(tr_node){
      tr_node.parentNode.removeChild(tr_node);
      td.builder.sum_refresher();
      td.builder.line_number_refresher(document.querySelector("#i_c"));
    },

    "line_number_refresher": function(tbody){
      var tr = tbody.querySelectorAll("tr");
      for (var i = 1; i < tr.length; i++) {
        tr[i].querySelector("td").innerHTML = i;
      }
    },

    "sum_refresher": function(){
      var i_c_tr=document.querySelector("#i_c").querySelectorAll('tr');
      var amount=money_received=0;
      for (var i = 1; i < i_c_tr.length; i++) {
        amount += Number(i_c_tr[i].querySelector("*[name='amount_on_unit_1']").innerHTML);
        money_received += Number(i_c_tr[i].querySelector("*[name='item_money_received']").innerHTML);
      };
      money_received=money_received.toFixed(2);
      document.querySelector("tfoot").querySelector("*[name='total_amount']").innerHTML = amount;
      document.querySelector("tfoot").querySelector("*[name='money_received']").innerHTML = Number(money_received);
      function convertCurrency(currencyDigits) { 
        // Constants: 
        var MAXIMUM_NUMBER = 99999999999.99; 
        // Predefine the radix characters and currency symbols for output: 
        var CN_ZERO = "零"; 
        var CN_ONE = "壹"; 
        var CN_TWO = "贰"; 
        var CN_THREE = "叁"; 
        var CN_FOUR = "肆"; 
        var CN_FIVE = "伍"; 
        var CN_SIX = "陆"; 
        var CN_SEVEN = "柒"; 
        var CN_EIGHT = "捌"; 
        var CN_NINE = "玖"; 
        var CN_TEN = "拾"; 
        var CN_HUNDRED = "佰"; 
        var CN_THOUSAND = "仟"; 
        var CN_TEN_THOUSAND = "万"; 
        var CN_HUNDRED_MILLION = "亿"; 
        var CN_SYMBOL = ""; 
        var CN_DOLLAR = "元"; 
        var CN_TEN_CENT = "角"; 
        var CN_CENT = "分"; 
        var CN_INTEGER = "整"; 
         
        // Variables: 
        var integral;    // Represent integral part of digit number. 
        var decimal;    // Represent decimal part of digit number. 
        var outputCharacters;    // The output result. 
        var parts; 
        var digits, radices, bigRadices, decimals; 
        var zeroCount; 
        var i, p, d; 
        var quotient, modulus; 
         
        // Validate input string: 
        currencyDigits = currencyDigits.toString(); 
        if (currencyDigits == "") { 
            alert("Empty input!"); 
            return ""; 
        } 
        if (currencyDigits.match(/[^,.\d]/) != null) { 
            alert("Invalid characters in the input string!"); 
            return ""; 
        } 
        if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) { 
            alert("Illegal format of digit number!"); 
            return ""; 
        } 
         
         // Normalize the format of input digits: 
        currencyDigits = currencyDigits.replace(/,/g, "");    // Remove comma delimiters. 
        currencyDigits = currencyDigits.replace(/^0+/, "");    // Trim zeros at the beginning. 
        // Assert the number is not greater than the maximum number. 
        if (Number(currencyDigits) > MAXIMUM_NUMBER) { 
            alert("Too large a number to convert!"); 
            return ""; 
        } 
         
        // Process the coversion from currency digits to characters: 
        // Separate integral and decimal parts before processing coversion: 
        parts = currencyDigits.split("."); 
        if (parts.length > 1) { 
            integral = parts[0]; 
            decimal = parts[1]; 
            // Cut down redundant decimal digits that are after the second. 
            decimal = decimal.substr(0, 2); 
        } 
        else { 
            integral = parts[0]; 
            decimal = ""; 
        } 
        // Prepare the characters corresponding to the digits: 
        digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE); 
        radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND); 
        bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION); 
        decimals = new Array(CN_TEN_CENT, CN_CENT); 
        // Start processing: 
        outputCharacters = ""; 
        // Process integral part if it is larger than 0: 
        if (Number(integral) > 0) { 
            zeroCount = 0; 
            for (i = 0; i < integral.length; i++) { 
                p = integral.length - i - 1; 
                d = integral.substr(i, 1); 
                quotient = p / 4; 
                modulus = p % 4; 
                if (d == "0") { 
                    zeroCount++; 
                } 
                else { 
                    if (zeroCount > 0) 
                    { 
                        outputCharacters += digits[0]; 
                    } 
                    zeroCount = 0; 
                    outputCharacters += digits[Number(d)] + radices[modulus]; 
                } 
                if (modulus == 0 && zeroCount < 4) { 
                    outputCharacters += bigRadices[quotient]; 
                } 
            } 
            outputCharacters += CN_DOLLAR; 
        } 
        // Process decimal part if there is: 
        if (decimal != "") { 
            for (i = 0; i < decimal.length; i++) { 
                d = decimal.substr(i, 1); 
                if (d != "0") { 
                    outputCharacters += digits[Number(d)] + decimals[i]; 
                } 
            } 
        } 
        // Confirm and return the final output string: 
        if (outputCharacters == "") { 
            outputCharacters = CN_ZERO + CN_DOLLAR; 
        } 
        if (decimal == "") { 
            outputCharacters += CN_INTEGER; 
        } 
        outputCharacters = CN_SYMBOL + outputCharacters; 
        return outputCharacters; 
      }


      document.querySelector("tfoot").querySelector("*[name='money_received_chinese']").innerHTML = convertCurrency(money_received);
      td.document_lists["invoice_id" + document.querySelector("#i_des").querySelector("*[name='invoice_id']").getAttribute("invoice_id")].money_received = money_received;

    },

    "number_check_when_input": function (e){
      if(e.keyCode >= 48 && e.keyCode<=57 || e.keyCode==46 || e.keyCode==32 || e.keyCode >= 37 && e.keyCode<=40 );
      else e.preventDefault();
    },

    "number_check_after_input": function(){
      if(this.innerHTML=="NaN") this.innerHTML = 0;
      if(this.innerHTML=="undefined") this.innerHTML = 0;
      this.innerHTML= Number(this.innerHTML);
      td.builder.sum_refresher();
      

    },

    //amount or price column 添加次为event listener
    "amount_or_price_affect_received": function (e){
      this.parentNode.querySelector('*[name="item_money_received"]').innerHTML = 
      Number(
        (
            (Number(this.parentNode.querySelector('*[name="price_base_on_unit"]').innerHTML)*100) * 
            (Number(this.parentNode.querySelector('*[name="amount_on_unit_1"]').innerHTML)*100)/10000
        ).toFixed(4)
      );
      td.builder.sum_refresher();

    },

    "receive_affects_price": function (e){
      var a = (
        Number(this.parentNode.querySelector('*[name="item_money_received"]').innerHTML)*1000/
        Number(this.parentNode.querySelector('*[name="amount_on_unit_1"]').innerHTML)/1000
        ).toFixed(5);
      if(a.toString()=="NaN"||a==Infinity) a = "";
      Number(a).toFixed(5);
      this.parentNode.querySelector('*[name="price_base_on_unit"]').innerHTML = Number(a);
      td.builder.sum_refresher();

    },

    //tr 用return function的方式,在viewer 中使用
    //td 用eventlistener 的方式，在创建中使用
    "make_td_contenteditable": function (type){
        this.setAttribute("contenteditable","true");
    },

    "query_products": function(e){
      if(e.keyCode == 13)
      {
        var q_condition_column;
        if (this.innerHTML.charCodeAt(0)>= 123 || this.innerHTML.charCodeAt(0)<= 96)
              q_condition_column = "full_name";
        else
              q_condition_column = "py_code";
  
        ajax_object.onreadystatechange = function(){
          if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200)
          {
            if(Number(ajax_object.response) != 0)
            {
              //重写查询结果对象
              td.query_result = JSON.parse(ajax_object.response);
              // td.queried_result_products = td.queried_result_products.concat(td.query_result);
              // td.queried_result_products = td.query_result;
              var p = $('#pop_up_modal');
              var pop_up = p.find("#pop_up");
              p.find(".modal-title").text("商品查询结果");
              p.tabIndex = 12;
              //清楚pop中上一次查询结果
              pop_up.html("");

              console.log("正在查询");
      
              p.modal("show");
              //t is #pop_pu->table
              var t = $("<table class='table table-bordered'></table>").appendTo(pop_up);
              var tb = $("<tbody></tbody>").appendTo(t);
              for(var j=0;j<td.query_result.length;j++)
              {
                var a = td.query_result[j];
                var new_tr = $("<tr></tr>");
                new_tr.on({
                  "click":  function(e){var that = this; td.selection_status(e, that,"select_one");},
                });

                new_tr.html(
                "<td>"+(j+1)+"</td>"+
                "<td style='display:none;' name='product_id'>"+a.id+"</td>"+
                "<td name='admin_defined_id'>"+(a.admin_defined_id?a.admin_defined_id:"")+"</td>"+
                "<td name='manufacturer'>"+(a.manufacturer?a.manufacturer:"")+"</td>"+
                "<td name='full_name' class='text-left'>"+(a.full_name?a.full_name:"")+"</td>"+
                "<td class='text-left'>"+(a.py_code?a.py_code:"")+"</td>"+
                "<td name='another_unit_factor'>"+(a.admin_defined_unit_2_factor?"1*"+a.admin_defined_unit_2_factor:"")+"</td>"+
                "<td>"+(a.hidden_toggle?a.hidden_toggle:"")+"</td>");
                new_tr.appendTo(tb);
              }
              pop_up.on("keypress",td.input_selected_products);
              p.find('.btn-primary').on("click", td.input_selected_products);
              p.find('.modal-content').on("click", function(e){var that = this; td.selection_status(e, that, "unselect_all");});

                  

              ajax_object.response = 0;

            }
              else 
                alert("当前查询条件无结果");
            }
          };
        ajax_object.open("GET", "query.php?query_multiple&q_columns_name=*&q_table=product_info&q_condition_column="+q_condition_column
             +"&q_condition_value="+this.innerHTML, true);
        ajax_object.send();
        e.preventDefault();
      }
    }
  },
  //builder 对象结束

  "query_single_and_modify": function(that, q_name, q_table, q_condition){
    //php发现query_single标记后，进行单挑条目查询，返回字符串
    var query_result;
    
    (function query(string) 
    {
    var ajax_object;
    if (window.XMLHttpRequest) ajax_object = new XMLHttpRequest();
    else {/*code for IE6, IE5*/ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}

    ajax_object.onreadystatechange = function(){
      if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200)

      that.innerHTML = ajax_object.response;

    };
    ajax_object.open("GET", "query.php?" + string, true);ajax_object.send();
    }
    )(
      "query_single&q_name="+q_name+"&q_table="+q_table+"&q_condition="+q_condition
     );
  },
  "query_multiple": function(q_columns_name, q_table, q_condition_column, q_condition_value){
    var that = this;

    (function query(string) 
    {
    ajax_object.onreadystatechange = function(){
      if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200) 

      if(JSON.parse(ajax_object.response)) that.query_result = JSON.parse(ajax_object.response);
      else query_result = false;

    };
    ajax_object.open("GET", "query.php?" + string, true);ajax_object.send();
    }
    )(
      "query_multiple&q_columns_name="+q_columns_name
         +"&q_table="+q_table
         +"&q_condition_column="+q_condition_column
         +"&q_condition_value="+q_condition_value
     );    
  },

  "make_selection_single": function (){
    document.querySelector('#pop_up').focus();
      if(this.className!=="info"){
          var a = document.querySelector("#pop_up").getElementsByClassName("info");
          for (var i = 0; i < a.length; i++) {
            a[i].className = "";
            }
          this.className="info";
      }
      else this.className="";
  },

  //使用info来进行选中高亮、选中标记
  "selection_status": function(e, that, type){
    if(type){
      if (type=="select_one") {
          document.querySelector('#pop_up').focus();
          if(that.className!=="info"){
            that.className="info";
          }
          else that.className="";
          e.stopPropagation();
        };
    
      if(type == 'unselect_all'){
          $(that).find(".info").removeClass('info');
        }
    
      // e.stopPropagation();
    }

  },

  "toggle_display": function (){
      if(window.getComputedStyle(this).display=="none"){
      this.style.display="block";
    }
      else this.style.display="none";
      
  },

  "esc_display": function(event){
      if(event.keyCode == 27){
      $("#pop_up_modal").modal("hide");
      }
  },

  "input_selected_products": function(event){
    if(event.keyCode ==13 || event.type=="click" ){
      //a 是选中的元素组成的数组
      //获取视图中发票的id
      var a = $("#pop_up").find(".info"),
          id = $("td[name='invoice_id']").attr("invoice_id"),
          i_c = $("#i_c"),
          new_tr;

      for (var i = 0; i < a.length; i++) {
        var o = {
            "product_id": $(a[i]).find('*[name="product_id"]').html(),
            "manufacturer":$(a[i]).find('*[name="manufacturer"]').html(),
            "full_name": $(a[i]).find('*[name="full_name"]').html(),
            "admin_defined_unit":"",
            "unit_1": "箱",
            "amount_on_unit_1": 0,
            "price_base_on_unit": 0,
            "item_money_received": 0,
            "comment_for_item":""
          };
        // td.document_lists["invoice_id"+id].document_content_array.push(o);
        new_tr = $(td.builder.new_line_creat_from_o_and_thead(o,td.document_lists.invoice_content_head_description_array));
        var e_point = i_c.find("*[input_end_point]").first();

        if(!e_point){
          i_c.children().last().attr("input_end_point","");
        }
        new_tr.insertBefore(e_point);
       }
       //for 循环结束
       if(e_point.get(0)!=e_point.parent().children().last().get(0)) e_point.remove();

       if(event.preventDefault)event.preventDefault();
       $("#pop_up_modal").find('.btn-primary').off("click", td.input_selected_products);

     //关闭pop_up
     td.esc_display({keyCode:27});
     td.builder.line_number_refresher(document.querySelector("#i_c"))
     }
  },

  "input_selected_des": function(event){
    if(event.keyCode ==13 || event.keyCode ==32 ||event.type=="dblclick" ){
      var a = document.querySelector("#pop_up").getElementsByClassName("info")[0];
       //获取视图中发票的id
      var id = document.querySelector("td[name='invoice_id']").getAttribute("invoice_id");

      //修改对象
      // cl(a.childNodes[1].innerHTML);
      td.document_lists["invoice_id"+id].trading_object = [a.childNodes[1].innerHTML,a.childNodes[2].innerHTML];
      //在此修tab
      var tab = document.querySelector("[my_invoice_id='"+id+"']");
      tab.querySelector("a").innerHTML = tab.querySelector("a").innerHTML.replace(/^(销售给|进货从).*/,'$1'+a.childNodes[2].innerHTML);

      //在此修td
      var des_td = document.querySelector("#i_des").querySelector("td[name='trading_object']");
      des_td.innerHTML=a.childNodes[2].innerHTML;
      des_td.setAttribute("placeholder",a.childNodes[2].innerHTML);
      // des_td.addEventListener("click",td.builder.cell_checker);
      des_td.addEventListener("blur", 
       function(){
       if(this.innerHTML!=this.getAttribute("placeholder"))
         this.innerHTML=this.getAttribute("placeholder");
       }
      );

      event.preventDefault();
     //关闭pop_up
     td.esc_display({keyCode:27});
     document.querySelector('#pop_up').removeEventListener("dblclick",td.input_selected_des);
     document.querySelector('#pop_up').removeEventListener("keypress",td.input_selected_des);
    }


  },

  "query_result": 0,

  "query_people": function(event){
    if (event.keyCode == 13){
        var that = this;
        var q_condition_column;
        //判断是否是拼音或者汉子
        if (that.innerHTML.charCodeAt(0)>= 123 ||
            that.innerHTML.charCodeAt(0)<= 96)
          q_condition_column = "full_name";
        else
          q_condition_column = "py_code";

        (function query(string) 
        {
        var ajax_object;
        if (window.XMLHttpRequest) ajax_object = new XMLHttpRequest();
        else {/*code for IE6, IE5*/ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}
        ajax_object.onreadystatechange = function(){
          if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200){
            if(Number(JSON.parse(ajax_object.response))!= 0) {
              //that, td 都可用，思考原因
              td.query_result = JSON.parse(ajax_object.response); 
              p = document.querySelector('#pop_up');
              p.tabIndex = 12;
              //清除pop中上一次查询结果
              p.innerHTML = "";

              console.log("ajax");//test exec
              var modal = $("#pop_up_modal");
                  modal.modal("show");
                  modal.find(".modal-title").text("往来单位查询结果");
                  modal.find(".btn-primary").on("click",td.input_selected_des);
              //t is #pop_pu->table
              var t = p.appendChild(document.createElement("table"));
              $(t).addClass("table table-bordered");
              var tb = t.appendChild(document.createElement("tbody"));
              for(var j=0;j<td.query_result.length;j++){
                var a = td.query_result[j];
                var new_tr = document.createElement("tr");
                new_tr.addEventListener("mouseenter", td.make_selection_single);
                new_tr.addEventListener("dblclick",td.input_selected_des);
                new_tr.innerHTML = 
                "<td>"+j+"</td>"+//j 行号
                "<td>"+a.id+"</td>"+
                "<td>"+(a.full_name?a.full_name:"")+"</td>"+
                "<td>"+(a.py_code?a.py_code:"")+"</td>"+
                "<td>"+(a.tel?a.tel:"")+"</td>"+
                "<td>"+(a.phone?a.phone:"")+"</td>";
                tb.appendChild(new_tr);
                }
                document.querySelector('#pop_up').addEventListener("keypress",td.input_selected_des);
            }
            else {
              ls.checker.status.pop_up_creator("查询提示", $("<p>当前查询条件无结果</p>").get(0));
              cl("当前查询条件无结果");
            }
          }
        }

          ajax_object.open("GET", "query.php?" + string, true);ajax_object.send();
          }
          )("query_multiple&q_columns_name=*&q_table=people&q_condition_column="+q_condition_column+"&q_condition_value="+that.innerHTML);

          //enter key event
          event.preventDefault();
          // event.stopPropagation();
        }
  }
};
//td 对象结束

// var css_modify = {
//   "drop_down_toggle_display":function(e){
//     // alert("good");
//     if (e.type=="mouseover")
//     this.querySelector("ul").style.display="block";
//     if(e.type=="mouseout")
//     this.querySelector("ul").style.display="none";
//   },

//   "add_mouser_over_out_to_element": function(selector){
//     document.querySelector(selector).addEventListener("mouseover", css_modify.drop_down_toggle_display);
//     document.querySelector(selector).addEventListener("mouseout", css_modify.drop_down_toggle_display);
//   }

// };
// css_modify.add_mouser_over_out_to_element("#invoice_create");
// css_modify.add_mouser_over_out_to_element("#basic_information_build");

function in_page_query (event){
  if(event.keyCode==13){
    var that = this;
    this.innerHTML = td.query_single_and_modify(that,"full_name","people","id="+this.innerHTML);
  
    event.preventDefault();
  }

}


//new file imported
//如何阻止用户close window？
window.onclose = window_close_check;

function window_close_check (e) {
  alert("what");
  e.preventDefault();
}

//ls,list 是与“列表”相关的对象，该对象主要实现以下功能：
  // 查询可以列表的信息，并以列表的形式展示信息（商品信息、客户信息、价格信息、经营历程之类）
  // 要求部分列表具有筛选功能
  // 对这些信息进行增添、修改、删除
// 主要列表的对象
//   product_info
//   people_info
//   specific_price_specific_person
//   invoice_list
//     history_invoice
//     draft_invoice
// 主要方法
//   display
//   query
//   filter

//   pr_q_d
//   pe_q_d

//   edit类方法
//   saver类方法
var ls = list = {
  "display": function(table_head, table_data){
    //table_head 是一个数组，[[{}...{}]...[{}...{}]],每一个元素对应一个td
      //每一个元素也是数组，这个数组由对应的td 的内容组成，比如属性、事件、innerHTM等
    //table_data 是一个数组，比上述数组高一阶[
      // [[{}...{}]...[{}...{}]],
      // ...
      // [[{}...{}]...[{}...{}]]
      // ]
    //[{}...{}]的元素是对象，其格式为{
    //   type = "a"/"e"/"i"
    //     a,attribute
    //     e,eventlistener
    //     i,innerHTML
    //   value = [name,value]/[listenertype,funcion]/"string"
    // }
    var ds = document.querySelector("#display_section");
    //条件语句，若当前窗口有未保存的修改，则不继续执行下列语句
    ds.innerHTML = "";
    //ds 变为新建的table
    ds = ds.appendChild(document.createElement("table"));
    ds.addEventListener("click", ls.checker.status.row_checker);
    $(ds).addClass("table-condensed");

    var thead=document.createElement("thead"),th = document.createElement("tr");//th是head_tr
    thead.appendChild(th);

    for (var i = 0; i < table_head.length; i++) {
      var td = document.createElement("th");
      for (var j = 0; j < table_head[i].length; j++) {
        switch(table_head[i][j].type){
          case "a": td.setAttribute(table_head[i][j].value[0],table_head[i][j].value[1]);break;
          case "e": td.addEventListener(table_head[i][j].value[0],table_head[i][j].value[1]);break;
          case "i": td.innerHTML= table_head[i][j].value;break;
        }
      };
      th.appendChild(td);
    };
    $(ds).addClass('table table-bordered');

    var tbody=document.createElement("tbody");
    ds.appendChild(thead);//表头字段写入页面
    ds.appendChild(tbody);


    for (var i = 0; i < table_data.length; i++) {//遍历每一个数组元素，创建对一个的tr，一个tr对应一个商品
      tbody.appendChild(ls.create_list_line(table_data[i], th));
    }

    ls.checker.list_row_number_checker();

  },

  create_list_line: function(table_data_i, tr_in_thead){
    //tr_in_thead 当前视图的表格中的thead 的 tr行
    var tr = document.createElement("tr");
    tr.setAttribute("td_modify_count",0);
    for (var j = 0; j < tr_in_thead.children.length; j++) {//遍历head_tr的每一个td，也就是每一列
      var td = document.createElement("td");
      for (var k = 0; k < table_data_i.length; k++) {//遍历单个商品数组的每一个元素，每个元素数组对应一个td
        for (var l = 0; l < table_data_i[k].length; l++) {//td对应tr数组的一个元素，遍历td元素的元素，
          if(table_data_i[k][l].type == "a" && table_data_i[k][l].value[0]=="name" && table_data_i[k][l].value[1]== tr_in_thead.children[j].getAttribute("name")) 
          { 
            for (var l = 0; l < table_data_i[k].length; l++) {
              //console.log(table_data);
              switch(table_data_i[k][l].type){
                case "a": td.setAttribute(table_data_i[k][l].value[0],table_data_i[k][l].value[1]);break;
                case "e": td.addEventListener(table_data_i[k][l].value[0],table_data_i[k][l].value[1]);break;
                case "i": td.innerHTML= table_data_i[k][l].value;
                    break;
              }
              // break;
            }
            break;break;
          }
        }
      }
      tr.appendChild(td);
    }
    return tr;
  },

  // 用于list查询
  //   商品列表的信息
  //   客户信息
  //   单据信息
  //   价格信息
  "query": function(queried_columns, table, q_condition_value){
    // 文件头声明的文件
    ajax_object.open("GET", "query.php?query_multiple&q_columns_name="+queried_columns+"&q_table="+table+"&q_condition_value="+q_condition_value, true);
    ajax_object.send();
  },

  "pr_q_d": function(e){
    //product query and display，用于商品信息的查询event listener
    // 在展示商品信息之前检查状态，如果有修改则提示用户保存修改
    // 创建p_display函数，这个函数用来展示商品信息
    if(ls.checker.status.whether_table_modified()) {
          alert("请保存或者放弃修改！");
          return;
    }

    // tab_content表示本tab 的内容的类型
    // 展示前，检查tab 内显示标签
    if(!document.querySelector("#documents_tab>ul").querySelector('*[list_content="product_info"]')){
      var a = document.createElement("li");
      // a.setAttribute("class","active");
      a.setAttribute("tab_content","list");
      //list_content表示 本
      a.setAttribute("list_content","product_info");
      a.innerHTML='<a href="#">商品信息</a>';
      a.addEventListener("click", ls.pr_q_d);
      a.addEventListener("click", ls.checker.status.tab_active_check);
      document.querySelector("#documents_tab>ul").appendChild(a);
    }
    
    ls.checker.status.tab_active_check.apply($('li[list_content="product_info"]').get(0));
    
    function p_display(){
      var p_names = ls.product_info[4];
      ls.edit.data_convert_JSON_to_array(ls.product_info[1], ls.product_info[2], p_names);

      //表头和表内容的表格
      ls.display(ls.product_info[5],ls.product_info[2]);

      //显示完成，将状态置0
      ls.product_info[0]=0;


      //给基础信息页面添加功能：新建商品、删除商品、保存更改、放弃更改（什么是更改？新建、删除、修改都是更改）
      //f_list是 ul元素
      var ds = $("#display_section");
      var f_container = $("<div></div>"/*,{
        class: "container"
      }*/).appendTo(ds);

      var f_list = $('<div></div>',{
        'name': 'f_list',
        class: "btn-group", 
        role:"group"
      }).appendTo(f_container);

      var f_list_1 = $('<button ></button>',{
        "name": "createNewItem",
        type: "button", 
        class: "btn btn-default"
      }).text("新建商品").on("click", ls.edit.item_creator);

      var f_list_2 = $('<button ></button>',{
        "name": "deleteItem",
        type: "button", 
        class: "btn btn-default"
      }).text("停用商品").on("click", function(){
        ls.checker.hidden_toggle.call($("tbody tr.info").find("[name='hidden_toggle']").get(0),{"type":"click"});
      });

      var f_list_3 = $('<button ></button>',{
        "name": "saveChange",
        type: "button", 
        class: "btn btn-default"
      }).text("保存修改").on("click", ls.edit.items_saver);

      var f_list_4 = $('<button ></button>',{
        "name": "abortChange",
        type: "button", 
        class: "btn btn-default"
      }).text("放弃并退出");

      f_list.append(f_list_1, f_list_2, f_list_3, f_list_4);
    }

    //检查ls.product_info[0]的值
      // -1表示没有数据，需要从服务器抓取数据
      // 0表示没有基础信息变动，无需从服务器抓取数据，直接显示商品
      // 1表示基础信息已有变动，需要更新到服务器

    if(ls.product_info[0]==0) p_display();
    else {

      // 文件头声明的文件
      ajax_object.onreadystatechange = function(){
        if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200){
          if(Number(ajax_object.response) != 0){
            ls["product_info"][1] = JSON.parse(ajax_object.response);//查询的结果数组立即作为数组存储
            ls["product_info"][0] = 0;
            p_display();
          }//内if结束
          else {
            alert("当前查询条件无结果");
            return;
          }
        }//外if 结束
      };

      ls.query("*","product_info","");
    }
  },

  "product_info": [
    -1,
    [],
    [],
    [1,[]],
    [
      "id",
      "manufacturer",
      "admin_defined_order",
      "full_name",
      "simple_name",
      "unit_1",
      "admin_defined_unit_1",
      "admin_defined_unit_1_factor",
      "admin_defined_unit_2",
      "admin_defined_unit_2_factor",
      "price_base",
      "price_for_manufacturer",
      "price_for_dealer",
      "price_for_bigger",
      "price_for_big",
      "price_for_Medium",
      "price_for_small",
      "price_for_smaller",
      "price_for_smallest",
      "py_code",
      // "size_id",
      "created_at",
      "changed_at",
      "hidden_toggle",
      "user_comment",
      "system_log"
    ],
    [
      [{type: "a",value:["name","line_number"]},{type: "i",value:"行号"}],
      [{type: "a",value:["name","product_id"]},{type: "i",value:"商品编号"}],
      [{type: "a",value:["name","manufacturer"]},{type: "i",value:"生产厂家"}],
      [{type: "a",value:["name","admin_defined_order"]},{type: "i",value:"用户排序"}],
      [{type: "a",value:["name","full_name"]},{type: "i",value:"商品全名"}],
      [{type: "a",value:["name","simple_name"]},{type: "i",value:"简名"}],
      [{type: "a",value:["name","admin_defined_unit_1"]},{type: "i",value:"辅助单位1"}],
      [{type: "a",value:["name","admin_defined_unit_1_factor"]},{type: "i",value:"辅助单位1系数"}],//辅助单位需要有alt 弹出提示吗？
      [{type: "a",value:["name","admin_defined_unit_2"]},{type: "i",value:"辅助单位2"}],
      [{type: "a",value:["name","admin_defined_unit_2_factor"]},{type: "i",value:"辅助单位2系数"}],//辅助单位需要有alt 弹出提示吗？
      [{type: "a",value:["name","price_base"]},{type: "i",value:"基准价"}],
      [{type: "a",value:["name","price_for_manufacturer"]},{type: "i",value:"厂商价"}],
      [{type: "a",value:["name","price_for_dealer"]},{type: "i",value:"经销商价"}],
      [{type: "a",value:["name","price_for_bigger"]},{type: "i",value:"特大户价"}],
      [{type: "a",value:["name","price_for_big"]},{type: "i",value:"大户价"}],
      [{type: "a",value:["name","price_for_Medium"]},{type: "i",value:"中户价"}],
      [{type: "a",value:["name","price_for_small"]},{type: "i",value:"小户价"}],
      [{type: "a",value:["name","price_for_smaller"]},{type: "i",value:"个人价"}],
      [{type: "a",value:["name","price_for_smallest"]},{type: "i",value:"零售价"}],
      [{type: "a",value:["name","py_code"]},{type: "i",value:"拼音码"}],
      [{type: "a",value:["name","created_at"]},{type: "i",value:"创建时间"}],
      [{type: "a",value:["name","changed_at"]},{type: "i",value:"上次修改时间"}],
      [{type: "a",value:["name","hidden_toggle"]},{type: "i",value:"是否停用"}],
      [{type: "a",value:["name","user_comment"]},{type: "i",value:"用户备注"}]
    ]
  ],
  //products_tag 加入,第一个元素表状态，
    // -1表示没有数据，需要从服务器抓取数据
    // 0表示没有基础信息变动，无需从服务器抓取数据，需要置0的情况：
      // 展示完成后
      // 更新过修改后
    // 1表示基础信息已有变动，需要更新到服务器;或者需要从服务器刷新数据
  // 第二个元素表示抓取的原始数据，
  // 第三个元素表示处理过，用于展示的数据
  // 第四个元素是一个包含两个元素的数组,该数组用语更新商品信息
    // 第一个元素表示更新状态，1表示需要更新（还未更新），0表示不需要更新(已经更新)
    // 第二个元素是数组，表示需要更新的商品，其格式：
      // [{},{}.....],每一个元素都是一个对象，对象格式：
      // 操作类型t：a表示添加，u表示更新（修改）,d表示删除
      // id：如果是删除或者更新，则指明id，否则id 为0
        // {
        //   t:"u",
        //   id: 0,
        //   content: {
        //     name: value,
        //     ...
        //   }
        // }
  // 第五个元素是一个数组,该数组用于描述商品的属性
  // 第六个元素是一个数组,该数组用于描述展示商品的列表的表头属性

  "people_info": [
    -1,
    [],
    [],
    [1,[]],
    [
      "id"
      "full_name"
      "simple_name"
      "person_in_charge"
      "tel"
      "phone"
      "Address"
      "role"
      "py_code"
      "password"
      "loyalty"
      "complexity"
    ],
    [
      [{type: "a",value:["name","line_number"]},{type: "i",value:"行号"}],
      [{type: "a",value:["name","people_id"]},{type: "i",value:"客户编号"}],
      [{type: "a",value:["name","admin_defined_order"]},{type: "i",value:"用户排序"}],
      [{type: "a",value:["name","full_name"]},{type: "i",value:"商品全名"}],
      [{type: "a",value:["name","simple_name"]},{type: "i",value:"简名"}],
      [{type: "a",value:["name","py_code"]},{type: "i",value:"拼音码"}],
      [{type: "a",value:["name","tel"]},{type: "i",value:"电话"}],
      [{type: "a",value:["name","phone"]},{type: "i",value:"手机"}],
      [{type: "a",value:["name","Address"]},{type: "i",value:"地址"}],
      [{type: "a",value:["name","role"]},{type: "i",value:"角色"}]
      [{type: "a",value:["name","loyalty"]},{type: "i",value:"忠诚度"}],
      [{type: "a",value:["name","complexity"]},{type: "i",value:"复杂度"}]
    ]
  ],
  //products_tag 加入,第一个元素表状态，
    // -1表示没有数据，需要从服务器抓取数据
    // 0表示没有基础信息变动，无需从服务器抓取数据，需要置0的情况：
      // 展示完成后
      // 更新过修改后
    // 1表示基础信息已有变动，需要更新到服务器;或者需要从服务器刷新数据
  // 第二个元素表示抓取的原始数据，
  // 第三个元素表示处理过，用于展示的数据
  // 第四个元素是一个包含两个元素的数组,该数组用语更新商品信息
    // 第一个元素表示更新状态，1表示需要更新（还未更新），0表示不需要更新(已经更新)
    // 第二个元素是数组，表示需要更新的商品，其格式：
      // [{},{}.....],每一个元素都是一个对象，对象格式：
      // 操作类型t：a表示添加，u表示更新（修改）,d表示删除
      // id：如果是删除或者更新，则指明id，否则id 为0
        // {
        //   t:"u",
        //   id: 0,
        //   content: {
        //     name: value,
        //     ...
        //   }
        // }
  // 第五个元素是一个数组,该数组用于描述商品的属性
  // 第六个元素是一个数组,该数组用于描述展示商品的列表的表头属性
  "specific_price_specific_person": [],



  "checker": {
    //status对象开始，
    //用于标记各种状态，用于检查各种状态，用于修改各种状态
    status: {
      //normal_check, 用来进行整体的check，防止用户在保存修改前就进入其他页面
      normal_check: function(){
        // 检查单机的目标，如果用户未保存修改，则不允许用户进入其他界面
        var srcE=event.target.tagName.toLowerCase();

        // console.log(srcE);
        if(srcE=="td"||
          srcE=="th"||
          srcE=="table"||
          srcE=="html"||
          event.target.parentElement.getAttribute("name")=="f_list"
          ){}
        else 
          if(ls.checker.status.whether_table_modified()) {
            alert("请保存或者放弃修改！");
            event.stopPropagation();
          }
      },

      pop_up_creator: function(modalTitle, modalBody){
        var modal = $("#pop_up_modal");
                  modal.modal("show");
                  modal.find(".modal-title").text(modalTitle).click();
        var p = document.querySelector('#pop_up');
        p.innerHTML="";
        p.appendChild(modalBody);
        modal.find("[data-dismiss]").first().focus();
      },
      
      "row_checker": function(e){
        $(this).find("tr.info").removeClass("info");
        if(e.target.tagName.toLowerCase()=="td" && e.target.hasAttribute("contenteditable")){
          var a = $(e.target).parent();
        }
        $(a).addClass("info");
        // .addClass("info");
      },

      // 检测标签栏上的tab 的active 状态
      // 更新此状态
      // 此作为click 的listener，加在被单机的项目（tab）上
      tab_active_check: function(event){
        var  tab=$("#documents_tab");
        tab.find(".active").removeClass("active");
        $(this).addClass('active');
      },


      whether_td_modified : function(){
      //这个函数用来检测td 的数据是否有改动
      // 第一步检测td的值是否和placeholder一致，placeholder是原始值，检测的方法是删除空白进行检测
        // 如果不同，则检查是否是空白
          // 如果是空白，则改成初始值，然后检查td 的修改状态。检查后，把修改状态变为假
            // 如果修改是真则td 的父元素td_modify_count计数-1

        if(this.innerHTML!=this.getAttribute("placeholder")){
          if(this.innerHTML.replace(removeSpaceInBeginEnd,"")=="") {
            this.innerHTML = this.getAttribute("placeholder");
            if(this.getAttribute("td_modify_status")=="true"){
              this.parentNode.setAttribute("td_modify_count", Number(this.parentNode.getAttribute("td_modify_count"))-1);
            }
            this.setAttribute("td_modify_status",false);
          }
          else {
            if(this.getAttribute("td_modify_status")=="false"){
            this.setAttribute("td_modify_status",true);
            this.parentNode.setAttribute("td_modify_count", 1+Number(this.parentNode.getAttribute("td_modify_count")));
            }
          }
        }
        else{
          if(this.getAttribute("td_modify_status")=="true"){
            this.parentNode.setAttribute("td_modify_count", Number(this.parentNode.getAttribute("td_modify_count"))-1);
          }
          this.setAttribute("td_modify_status",false);
        }

        if(Number(this.parentNode.getAttribute("td_modify_count"))>0){
          this.parentNode.setAttribute("tr_modified","");
        }
        else{
          this.parentNode.removeAttribute("tr_modified");
        }
        
      ls.checker.status.whether_table_modified();
      },

      whether_td_modified_allow_space : function(){
      //这个函数用来检测td 的数据是否有改动
      // 第一步检测td的值是否和placeholder一致，placeholder是原始值，检测的方法是删除空白进行检测
        // 如果不同，则检查是否是空白
          // 如果是空白，则改成初始值，然后检查td 的修改状态。检查后，把修改状态变为假
            // 如果修改是真则td 的父元素td_modify_count计数-1

        if(this.innerHTML!=this.getAttribute("placeholder")){
          if(this.getAttribute("td_modify_status")=="false"){
            this.setAttribute("td_modify_status",true);
            this.parentNode.setAttribute("td_modify_count", 1+Number(this.parentNode.getAttribute("td_modify_count")));
          }
        }
        else{
          if(this.getAttribute("td_modify_status")=="true"){
            this.parentNode.setAttribute("td_modify_count", Number(this.parentNode.getAttribute("td_modify_count"))-1);
          }
          this.setAttribute("td_modify_status",false);
        }

        if(Number(this.parentNode.getAttribute("td_modify_count"))>0){
          this.parentNode.setAttribute("tr_modified","");
        }
        else{
          this.parentNode.removeAttribute("tr_modified");
        }
        
      ls.checker.status.whether_table_modified();
      },

      whether_table_modified : function(){
        var ds = document.querySelector("#display_section");
        var ds_t = ds.querySelector("table");
        if(ds_t){
          if($(ds_t).find("[tr_modified]").get(0)){
            $('[name="saveChange"]').addClass('btn-primary').removeAttr("disabled");
            $('[name="abortChange"]').addClass('btn-danger').removeAttr("disabled");
            return true;
          }
          else{
            $('[name="saveChange"]').removeClass('btn-primary').attr("disabled","");
            $('[name="abortChange"]').removeClass('btn-danger').attr("disabled","");
            return false;
          }
        }
      }//whether_table_modified函数结束

    },//status 对象结束

    list_row_number_checker: function(){
      var rows = document.querySelectorAll("tbody tr");
      for (var i = 0;i < rows.length; ++i) {
        rows[i].querySelector("td").innerHTML=1+i;
      }

    },

    admin_defined_order_checker: function(){
      var rows = document.querySelectorAll("tbody tr");
      for (var i = 0;i < rows.length; ++i) {
        var a = rows[i].querySelector("[name='admin_defined_order']");
        a.innerHTML=1+i;
        ls.checker.status.whether_td_modified.call(a);
      }
    },

    "word_check_when_input": function (e){
      if(e.keyCode == 13) e.preventDefault();
    },

    //用于标注基本信息是否隐藏
    hidden_toggle: function(e){
      if(e.type=="click"||e.keyCode == 32){
        var a = ls.checker.true_or_false("trueFalseToggle", this.innerHTML, "Boolean");
        this.innerHTML=ls.checker.true_or_false("toAnotherValueType", a, "√");
        ls.checker.status.whether_td_modified_allow_space.call(this);
      }
    },

    "true_or_false": function(type, inputValue, returnType){
    //type 指明toBoolean, trueFalseToggle, toAnotherValueType
      var value, valueType;
      switch(inputValue){
        case true:
        case "true":
        case "真":
        case "√":
        case 1: value = true;break;

        case false:
        case undefined:
        case "false":
        case "":
        case "假":
        case 0: value = false;break;
      }

      switch(inputValue){
        case true: valueType="Boolean";break;
        case "true": valueType="String";break;
        case "真":  valueType="Chinese";break;
        case "√":  valueType="√";break;
        case 1: valueType="Number";break;

        case false: valueType="Boolean";break;
        case undefined: valueType="Boolean";break;
        case "false":valueType="String";break;
        case "": valueType="√";break;
        case "假": valueType="Chinese";break;
        case 0: valueType="Number";break;
      }


      switch(type){
        case "toBoolean" :return Boolean(value);break;
        case "trueFalseToggle":return ls.checker.true_or_false("toAnotherValueType", value?false:true, returnType);break;
        case "toAnotherValueType": 
            switch(returnType){
              case "Boolean": return value?true:false;break;
              case "String": return value?"true":"false";break;
              case "Chinese": return value?"真":"假";break;
              case "√": return value?"√":"";break;
              case "Number": return value?1:0;break;
            };
        break;
      }
    },

    "number_check_after_input": function(){
      if(this.innerHTML!=""){
        var a = Number(this.innerHTML.replace(/ |　|&nbsp;/g,""));
        if(a=="NaN"|| a=="undefined") a = "";
        this.innerHTML= Number(a.toFixed(5));
      }
      
    }
  },



  "history_invoice": [],
  "draft_invoice": [],

  "edit": {
    data_convert_JSON_to_array: function(JSON_array, storeArray, p_names){
    //参数是数组，数组的元素是JSON 对象
      // 定义一些需要使用的元素属性的值
      var c_e = ["contenteditable","true"];
      var nc_w = ["keypress",td.builder.number_check_when_input];
      var nc_a = ["blur",ls.checker.number_check_after_input];
      var text_s = ["click", td.builder.cell_checker];

      for (var i = 0; i < JSON_array.length; i++) {
      //外循环开始，遍历每一个商品

        //所有商品属性名组成的数组
        // var p_names = p_names.push(Object.getOwnPropertyNames(ls.product_info[1][i]));
        

        // 把每一个服务器的商品转化成易于展示的格式，存储到ls.product_info[2]数组中
        storeArray[i] = [];

        // ls.product_info[2][i][j]中存储的是
            // 第i个商品的
              // 第j个属性
                // 每个商品属性都由数组描述，该数组每一个元素决定了商品属性的展示方式，实际上是商品属性的html<元素>的属性
        for (var j = 0; j < p_names.length; j++) {
          // 该循环遍历每一个属性名称
          // a是第j个商品的商品属性（比如名称）的html元素的描述数组（这些属性包括html 元素属性a,事件监听器e,内部html,i）
          var a = storeArray[i][j] = []; 

          // 每一个商品属性对应的html元素都需要拥有name 属性
          if(p_names[j]=="id")
            // 需要修改
            a.push({type:"a",value:['name','product_id']});
          else
            a.push({type:"a",value:['name',p_names[j]]});   
          var td_value = JSON_array[i][p_names[j]];//原来的值
          var placeholder = td_value?td_value.toString():"";

          if(td_value && td_value!="null" && td_value!="undefined")
            // i代表 innerHtml
            a.push({type:"i",value: td_value});

          //需要包含的函数预定义
          function editable(){
            a.push({type: "a", value: c_e}); 
            a.push({type: "a", value: ["td_modify_status", false]});
            a.push({type: "a", value: ["placeholder", placeholder]});//把原来的值存入placeholder 属性中，便于后来的状态检查
            a.push({type: "e", value: ["blur",ls.checker.status.whether_td_modified]});
            
            a.push({type: "e", value: ["keypress", ls.checker.word_check_when_input]});
            a.push({type: "e", value: ["keydown", ls.edit.arrow_key_control]});
            a.push({type: "e", value: text_s});
          }
          function e_num(){//add event listener for num tds
            a.push({type: "a", value: ["td_modify_status", false]});
            a.push({type: "a", value: ["placeholder", placeholder]});//把原来的值存入placeholder 属性中，便于后来的状态检查
            a.push({type: "e", value: ["blur",ls.checker.status.whether_td_modified]});
            a.push({type: "e", value: ["keydown", ls.edit.arrow_key_control]});

            a.push({type: "a", value: c_e}); 
            a.push({type: "e", value: nc_w});
            a.push({type: "e", value: nc_a});
            a.push({type: "e", value: text_s});
          }

          switch(p_names[j]){
            case "id" : 
            break;
            case "manufacturer" : editable(); break;
            case "admin_defined_order" : 
                editable();
                break;
            case "full_name" : 
                editable();
                a.push({type: "e", value: ["blur", ls.edit.py_code_editor]});
                break;
            case "simple_name" : editable(); break;

            case "unit_1" : editable(); break;

            case "admin_defined_unit_1" : editable(); break;
            case "admin_defined_unit_1_factor" :e_num(); break;
            case "admin_defined_unit_2" :editable(); break;
            case "admin_defined_unit_2_factor" :e_num(); break;

            case "price_base" :
            case "price_for_manufacturer" :
            case "price_for_dealer" :
            case "price_for_bigger" :
            case "price_for_big" :
            case "price_for_Medium" :
            case "price_for_small" :
            case "price_for_smaller" :
            case "price_for_smallest" :e_num();break;
            
            case "py_code" : 
                a.push({type: "a", value: ["td_modify_status", false]});
                a.push({type: "a", value: ["placeholder", placeholder]});//把原来的值存入placeholder 属性中，便于后来的状态检查
                break;

            // case "size_id" :editable(); break;
            case "created_at" :;break;
            case "changed_at" :;break;
            case "hidden_toggle" :
                var hidden_toggle_value = ls.checker.true_or_false("toAnotherValueType", td_value==""||td_value=="off"||td_value==undefined?false:true, "√");
                a.push(
                {type: "a", value: ["td_modify_status", false]},
                {type: "a", value: ["placeholder", hidden_toggle_value]},//把原来的值存入placeholder 属性中，便于后来的状态检查
                {type: "e", value: ["click",ls.checker.hidden_toggle]},
                {type: "e", value: ["keypress",ls.checker.hidden_toggle]},
                {type: "e", value: ["blur",ls.checker.status.whether_td_modified]},
                {
                  type: "i",  value: hidden_toggle_value
                }
                );
                break;
            case "user_comment" :editable(); break;
            case "system_log" :;break;
            default:

            break;
          }

        }//内循环结束
      }//外循环结束

    },


    item_creator: function(){
    // 创建客户或者商品
      var o={},
          a=[],
          tbody = $("tbody"),
          start = $("tr.info");
      
      for(var i=0; i < ls.product_info[4].length;++i){
        o[ls.product_info[4][i]]="";
      }
      ls.edit.data_convert_JSON_to_array([o],a,ls.product_info[4]);
      
      var new_tr = $(ls.create_list_line(a[0], $("thead tr").get(0)));
      if(!start.get(0)) new_tr.prependTo(tbody);
      else start.after(new_tr);

      ls.checker.list_row_number_checker();
      ls.checker.admin_defined_order_checker();

    },

    items_saver: function(){
      var trs = $("tr[tr_modified]");
      if(trs.get(0)){
      var o_array=[];

      function Item(tr){
        var o={},
            a = $(tr).find('[name="product_id"]'),
            tds = $(tr).find('[td_modify_status="true"]'); 
            
            o.content = {};

        o.id=a.text() == ""?0:a.text();
        o.t=a.text() == ""?"a":"u";

        for (var i = 0; i < tds.length; i++) {
          var td = $(tds[i]);
          if(td.attr("name")=="hidden_toggle"){
            if(td.text()=="√")o.t="d";
            o.content[td.attr("name")]=td.text()=="√"?1:2;
          }
          else
          o.content[td.attr("name")]=td.text();
        };
        return o;
      }


      for (var i = 0; i < trs.length; i++) {
        ls.product_info[3][1][i] = Item(trs[i]);
      };

      //状态
      ls.product_info[3][0]=1;
      $.ajax({
        url: "update.php?table=product_info",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(ls.product_info[3][1]),
        success: function(data, status, XMLHttpRequest_object){
          cl(data);
          ls.product_info[0]=1;
          $('[td_modify_status="true"]').attr("td_modify_status",false);
          $("tr[td_modify_count]").attr("td_modify_count",0);
          $("tr[tr_modified]").removeAttr("tr_modified");
          ls.checker.status.whether_table_modified();
        }
      });
    }

    },

    py_code_editor: function(){
      var that = this;

      that.innerHTML=that.innerHTML.replace(removeSpaceInBeginEnd,"");

      var py_code = $(that).parent().find('*[name="py_code"]');
      function input_Pinyin(string){
        py_code.text(string);
        ls.checker.status.whether_td_modified.apply(py_code.get(0));
      }
      if($(this).attr("td_modify_status")=="true"){
        if(!$("script[name='Chinese_to_pinyin.js']").get(0)) {
          $.ajax({
            url: "js/Chinese_to_pinyin.js",
            type: "get",
            success: function(result){
              cl("正在加载汉字转拼音脚本");
              $("<script name='Chinese_to_pinyin.js'></script>").appendTo($("head")).text(result);
              input_Pinyin((pinyin.getCamelChars(that.innerHTML)).toLowerCase());
            }
          });
        }
        else
          input_Pinyin((pinyin.getCamelChars(that.innerHTML)).toLowerCase());
      } 
      else
        input_Pinyin(" ");
    },

    arrow_key_control: function(e){
      if(e.keyCode >= 37 && e.keyCode<=40 ){
        var original_value = $(this).text(),new_td;
        switch(e.keyCode){
          //←
          case 37: 
              var prev_editable_td = $(this).prevAll('[contenteditable="true"]')[0];
              if(prev_editable_td){
                new_td = prev_editable_td;
                $(prev_editable_td).focus().click();
              }

              break;
          //↑
          case 38:
              var this_name = $(this).attr("name");
              var prev_editable_td = $(this).parent().prev().find("td[name='"+this_name+"']")[0];
              if(prev_editable_td){
                new_td = prev_editable_td;
                $(prev_editable_td).focus().click();
              }
              break;
          //→
          case 39:
              var next_editable_td = $(this).nextAll('[contenteditable="true"]')[0];
              if(next_editable_td){
                new_td = next_editable_td;
                $(next_editable_td).focus().click();
              }

              break;
          //↓
          case 40:
              var this_name = $(this).attr("name");
              var next_editable_td = $(this).parent().next().find("td[name='"+this_name+"']")[0];
              if(next_editable_td){
                new_td = next_editable_td;
                $(next_editable_td).focus().click();
              }
              break;
          default:
              break;
        }
        if(e.shiftKey&&new_td){
          $(new_td).text(original_value);
        }
        e.preventDefault();
      }
    },
    
    "edit_event": function(){},
    "updater": function(){}, //for basic_info
    "event": function(){} //event for edit
  },

  "saver": function(){}, //for invoice

  "filter": function(){}, //for information displaying
};

$(".dropdown-menu li").addClass("btn");

document.querySelector("#checkout_product_info").addEventListener("click", ls.pr_q_d);
document.addEventListener("click",ls.checker.status.normal_check, true);

document.querySelector("#creator_xs").addEventListener("click", td.creator_xs);
document.querySelector("#creator_jh").addEventListener("click", td.creator_jh);

document.addEventListener("keydown", td.esc_display);
