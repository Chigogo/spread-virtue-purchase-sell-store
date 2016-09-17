var ajax_object;
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
        "invoice_id1": 
        {////INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        "trading_object": [1,"系统"],
        "doc_type" : "xs",//set('xs','jh','cg','db','dd'),销售，进货，草稿，调拨，用户订单
        "storehouse" : [1,"仓库1"],//[01,"仓库1"],
        "money_received" : 0,//Decimal(12,2),
        "comment" : '',//varchar(63)，描述区的备注
        "document_status" : "管理员编辑",  /*"成功", "管理员反冲", "管理员编辑", "用户提交（关）", "用户编辑", "用户开", "管理员取消", "用户取消"*/
        
        // "document_description": 
        "document_content_array": 
          [
          {
            "id": 123,
            "admin_defined_id": "昌裕003",
            "full_name": "小脆筒",
            "another_unit_factor": 0,//from another_unit
            "another_unit": "只",
            "un": "箱",//标注用户所选用的计算规格的方式
            "amount_on_unit_1": 0,
            "item_money_received": 0,
            "comment": ""
          }
          ]
      }
  },
  //方法————单据对象的查看
  "viewer": function(invoice_id){
    var des = document.querySelector('#i_des');

    des.querySelector('td[name="invoice_id"]').id = invoice_id;
    var a = td.document_lists["invoice_id"+invoice_id];

    if(a.trading_object[1])
      des.querySelector('td[name="trading_object"]').innerHTML = a.trading_object[1];
    else
      des.querySelector('td[name="trading_object"]').innerHTML ="";

    des.querySelector('td[name="generated_id"]').innerHTML = a.doc_type+"-"+invoice_id;

    des.querySelector('td[name="store_house"]').innerHTML = a.storehouse[1];
    
    des.querySelector('td[name="comment"]').innerHTML = a.comment;  

    if(a.money_received)
    des.querySelector('td[name="money_received"]').innerHTML = a.money_received;

    var c = document.querySelector('#i_c');
    //清空，并初始化表格
    c.innerHTML = '<tr> <th>行号</th> <th>id</th><th>商品编号</th><th>商品全名</th><th>规格</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th><th>备注</th></tr>';

    for (var i = 0; i < a.document_content_array.length; i++) {
      c.appendChild(td.builder.new_line_creator(a.document_content_array[i]));
    };
    var last_line = document.createElement("tr")

    //new line 模版
    last_line.innerHTML='<tr class="product_item" ><td name="line_number">1</td> <td>001</td><td name="admin_defined_id" ></td><td name="full_name" ></td><td></td><td>箱</td><td name="amount"></td><td name="price_base_on_unit"></td><td name="amount_multiply_by_unit"></td><td name="comment_for_item"></td></tr>';
    c.appendChild(last_line);
    for (var i = 1; i < c.childNodes.length; i++) {
      td.builder.make_td_contenteditable.call(c.childNodes[i],"tr");
      c.childNodes[i].childNodes[4].addEventListener("keypress",td.builder.query_multiple_enter_multiple);
    }
    td.builder.line_number_refresher(c);
  },


  //方法————单据对象的创建
  "creator": function (doc_type){
    var c_new_i;
    (function query(string){
      var ajax_object;
      if (window.XMLHttpRequest) ajax_object = new XMLHttpRequest();
      else {/*code for IE6, IE5*/ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}

      ajax_object.onreadystatechange = function(){
        if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200){

          c_new_i = ajax_object.response;

          var invoice = "invoice_id"+c_new_i;
          td.document_lists[invoice] = {
            "trading_object": [0,""],
            "doc_type" : doc_type,
            "storehouse" : [1,"仓库1"],
            "money_received" : undefined,
            "comment" : "",
            "document_status" : "管理员编辑", 
            "document_content_array": []
          };
          //创建并添加到视图
          td.viewer(c_new_i);
        }
      };
      ajax_object.open("GET", "query.php?" + string, true);ajax_object.send();
      })//此处传入的c_new_i是字符串，php发现此标记后，进行新发票的创建，返回新发票id
    ("c_new_i=1&doc_type="+doc_type);
  },

  "xs_creator": function(){
    td.creator("xs");
  },
  /*
  如果该方法由viewer 唤起，则为相应td 元素添加事件处理器；
  如果该方法用于创建表格列表，则
    使用字符串或者py_code来检索商品，陈列商品，为列表添加时间处理器
    当用户选中某几个条目时，将条目写入发票中，写入td的lists 中
  */
  "builder": {
    new_line_creator: function (a){//a是document_content_array的item
      var new_tr, ln_td, id_td, adid_td, fn_td, md_td, un_td, am_td, pr_td, gn_td, cm_td;

      new_tr = document.createElement("tr"); new_tr.addEventListener("blur", null);//失去焦点，立即更新对应的对象

      ln_td = document.createElement("td"); ln_td.setAttribute("name","line_number");
      id_td = document.createElement("td"); id_td.setAttribute("name",'product_id');
      adid_td = document.createElement("td"); adid_td.setAttribute("name",'admin_defined_id');
      fn_td = document.createElement("td"); fn_td.addEventListener("keypress",td.builder.query_multiple_enter_multiple);
                                            fn_td.setAttribute("name","full_name");
                                            fn_td.setAttribute("contenteditable","true");
      md_td = document.createElement("td"); md_td.setAttribute("name","another_unit_factor");
      un_td = document.createElement("td");
      am_td = document.createElement("td"); am_td.setAttribute("name",'amount'); 
                                            am_td.addEventListener("blur",td.builder.number_check_after_input);
                                            am_td.addEventListener("blur",td.builder.amount_or_price_affect_received);
                                            am_td.addEventListener("keypress", td.builder.number_check_when_input);
                                            am_td.setAttribute("contenteditable","true");
      pr_td = document.createElement("td"); pr_td.setAttribute("name",'price_base_on_unit');
                                            pr_td.addEventListener("blur",td.builder.number_check_after_input);
                                            pr_td.addEventListener("blur",td.builder.amount_or_price_affect_received);
                                            pr_td.addEventListener("keypress", td.builder.number_check_when_input);
                                            pr_td.setAttribute("contenteditable","true");
      gn_td = document.createElement("td"); gn_td.setAttribute("name",'amount_multiply_by_unit');
                                            gn_td.addEventListener("blur",td.builder.number_check_after_input);
                                            gn_td.addEventListener("blur",td.builder.receive_affects_price);
                                            gn_td.addEventListener("keypress", td.builder.number_check_when_input);
                                            gn_td.setAttribute("contenteditable","true");
      cm_td = document.createElement("td"); cm_td.setAttribute("name",'comment_for_item');
                                            cm_td.setAttribute("contenteditable","true");

      ln_td.innerHTML ="";
      id_td.innerHTML =a.id;
      adid_td.innerHTML = a.admin_defined_id;
      fn_td.innerHTML =a.full_name;
      md_td.innerHTML ="1*"+a.another_unit_factor;
      un_td.innerHTML =a.un;
      am_td.innerHTML =a.amount_on_unit_1;
      pr_td.innerHTML =a.price?a.price:0;
      gn_td.innerHTML =a.item_money_received?a.item_money_received:0;
      cm_td.innerHTML =a.comment; 

      new_tr.appendChild(ln_td);
      new_tr.appendChild(id_td);
      new_tr.appendChild(adid_td);
      new_tr.appendChild(fn_td);
      new_tr.appendChild(md_td);
      new_tr.appendChild(un_td);
      new_tr.appendChild(am_td);
      new_tr.appendChild(pr_td);
      new_tr.appendChild(gn_td);
      new_tr.appendChild(cm_td);

      //   new_tr.innerHTML = 
      // "<td>"+(j+1)+"</td>"+
      // "<td>"+a.id+"</td>"+
      // "<td name='admin_defined_id'>"+a.admin_defined_id+"</td>"+
      // "<td>"+a.full_name+"</td>"+
      // "<td>1*"+a.admin_defined_unit_2+"</td>"+
      // "<td>"+a.unit_1+"</td>"+
      // "<td name='amount'>"+a.amount+"</td>"+
      // "<td name='price_base_on_unit'>"+a.price +"</td>"+
      // "<td name='amount_multiply_by_unit'></td>"+
      // "<td name='comment_for_item'>"+a.comment+"</td>";//amount ?
      
      return new_tr;
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
        amount += Number(i_c_tr[i].querySelector("*[name='amount']").innerHTML);
        money_received += Number(i_c_tr[i].querySelector("*[name='amount_multiply_by_unit']").innerHTML);
      };
      document.querySelector("tfoot").querySelector("*[name='total_amount']").innerHTML = amount;
      document.querySelector("tfoot").querySelector("*[name='money_received']").innerHTML = Number(money_received.toFixed(2));
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
      td.document_lists["invoice_id" + document.querySelector("#i_des").querySelector("*[name='invoice_id']").getAttribute("id")].money_received = money_received;

    },

    "number_check_when_input": function (e){
      if(e.keyCode >= 48 && e.keyCode<=57 || e.keyCode==46);
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
      this.parentNode.querySelector('*[name="amount_multiply_by_unit"]').innerHTML = 
      Number(this.parentNode.querySelector('*[name="price_base_on_unit"]').innerHTML) * 
      Number(this.parentNode.querySelector('*[name="amount"]').innerHTML);
      td.builder.sum_refresher();

    },

    "receive_affects_price": function (e){
      var a = (Number(this.parentNode.querySelector('*[name="amount_multiply_by_unit"]').innerHTML)*1000/Number(this.parentNode.querySelector('*[name="amount"]').innerHTML)/1000).toFixed(5);
      // for (var i = a.length - 1; i >= 0; i--) {
      //   a[i]=="0"?a[i]=="":break;
      // };
      if(a.toString()=="NaN"||a==Infinity) a = "";
      this.parentNode.querySelector('*[name="price_base_on_unit"]').innerHTML = Number(a);
      td.builder.sum_refresher();

    },

    //tr 用return function的方式,在viewer 中使用
    //td 用eventlistener 的方式，在创建中使用
    "make_td_contenteditable": function (type){
      if (type == "tr"){
        this.querySelector('*[name="full_name"]').setAttribute("contenteditable","true");
        this.querySelector('*[name="amount"]').setAttribute("contenteditable","true");
        this.querySelector('*[name="amount_multiply_by_unit"]').setAttribute("contenteditable","true");
        this.querySelector('*[name="price_base_on_unit"]').setAttribute("contenteditable","true");
        this.querySelector('*[name="comment_for_item"]').setAttribute("contenteditable","true");
      }
      if(type == "td"){
        this.setAttribute("contenteditable","true");
      }
    },

    "query_multiple_enter_multiple": function(e){
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
              td.query_result = JSON.parse(ajax_object.response);
              td.queried_result_products = td.queried_result_products.concat(td.query_result);
              // td.queried_result_products = td.query_result;
              p = document.querySelector('#pop_up');
              p.tabIndex = 12;
              //清楚pop中上一次查询结果
              p.innerHTML = "";
  
              // console.log("ajax");//test exec
              td.toggle_display.call(p);
              //t is #pop_pu->table
              var t = p.appendChild(document.createElement("table"));
              var tb = t.appendChild(document.createElement("tbody"));
              for(var j=0;j<td.query_result.length;j++)
              {
                var a = td.query_result[j];
                var new_tr = document.createElement("tr");
                new_tr.addEventListener("click", td.toggle_selection);
                new_tr.addEventListener("keypress", td.toggle_selection);

                new_tr.innerHTML = 
                "<td>"+(j+1)+"</td>"+
                "<td style='display:none;' name='product_id'>"+a.id+"</td>"+
                "<td name='admin_defined_id'>"+a.admin_defined_id+"</td>"+
                "<td name='full_name'>"+a.full_name+"</td>"+
                "<td>"+a.py_code+"</td>"+
                "<td name='another_unit_factor'>1*"+a.admin_defined_unit_2_factor+"</td>"+
                "<td>"+a.hidden_toggle+"</td>";
                tb.appendChild(new_tr);
              }
              ajax_object.response = 0;
              document.querySelector('#pop_up').addEventListener("dblclick",td.input_selected_products);
              document.querySelector('#pop_up').addEventListener("keypress",td.input_selected_products);
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
////
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
      if(this.className!=="selected"){
          var a = document.querySelector("#pop_up").getElementsByClassName("selected");
          for (var i = 0; i < a.length; i++) {
            a[i].className = "unselected";
            }
          this.className="selected";
      }
      else this.className="unselected";
  },

  "toggle_selection": function(e){
    if (e.keyCode==32 || e.type=="click") {
      document.querySelector('#pop_up').focus();
        if(this.className!=="selected"){
            this.className="selected";
        }
        else this.className="unselected";
      };
  },

  "toggle_display": function (){
      if(window.getComputedStyle(this).display=="none"){
      this.style.display="block";
    }
      else this.style.display="none";
      
  },

  "esc_display": function(event){
      if(event.keyCode == 27){
      document.querySelector("#pop_up").style.display="none";
      }
  },

  "input_selected_products": function(event){
    if(event.keyCode ==13 || event.type=="dblclick" ){
      //a 是选中的元素组成的数组
      var a = document.querySelector("#pop_up").getElementsByClassName("selected");
       //获取视图中发票的id
      var id = document.querySelector("td[name='invoice_id']").getAttribute("id");
      var new_tr;
      for (var i = 0; i < a.length; i++) {
        var o = {
            "id": a[i].querySelector('*[name="product_id"]').innerHTML,
            "admin_defined_id": a[i].querySelector('*[name="admin_defined_id"]').innerHTML,
            "full_name": a[i].querySelector('*[name="full_name"]').innerHTML,
            "md": a[i].querySelector('*[name="another_unit_factor"]').innerHTML,
            "un": "箱",//标注用户所选用的计算规格的方式
            "amount": 0,
            "price": 0,//如何获取最新价格？
            "item_money_received": 0
          };
        td.document_lists["invoice_id"+id].document_content_array.push(o);
        new_tr = td.builder.new_line_creator(o);
        document.querySelector("#i_c").insertBefore(new_tr, document.querySelector("#i_c").lastChild);

       };

       event.preventDefault();
     //关闭pop_up
     td.esc_display({keyCode:27});
     td.builder.line_number_refresher(document.querySelector("#i_c"))
     document.querySelector('#pop_up').removeEventListener("dblclick",td.input_selected_products);
     document.querySelector('#pop_up').removeEventListener("keypress",td.input_selected_products);
     }
  },

  "input_selected_des": function(event){
    if(event.keyCode ==13 || event.keyCode ==32 ||event.type=="dblclick" )

     { var a = document.querySelector("#pop_up").getElementsByClassName("selected")[0];
           //获取视图中发票的id
           var id = document.querySelector("td[name='invoice_id']").getAttribute("id");

           //修改对象
           td.document_lists["invoice_id"+id].trading_object = [a.childNodes[1].innerHTML,a.childNodes[2].innerHTML];
           //在此修td
           document.querySelector("#i_des").querySelector("td[name='trading_object']").innerHTML=a.childNodes[2].innerHTML;
           document.querySelector("#i_des").querySelector("td[name='trading_object']").setAttribute("placeholder",
            a.childNodes[2].innerHTML);
           document.querySelector("#i_des").querySelector("td[name='trading_object']").addEventListener("blur", 
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
    
          if(Number(JSON.parse(ajax_object.response)) != 0) {
            //that, td 都可用，思考原因
            td.query_result = JSON.parse(ajax_object.response);
            p = document.querySelector('#pop_up');
            p.tabIndex = 12;
            //清楚pop中上一次查询结果
            p.innerHTML = "";

            console.log("ajax");//test exec
            td.toggle_display.call(p);
            //t is #pop_pu->table
            var t = p.appendChild(document.createElement("table"));
            var tb = t.appendChild(document.createElement("tbody"));
            for(var j=0;j<td.query_result.length;j++){
              var a = td.query_result[j];
              var new_tr = document.createElement("tr");
              new_tr.addEventListener("mouseover", td.make_selection_single);
              new_tr.innerHTML = 
              "<td>"+j+"</td>"+
              "<td>"+a.id+"</td>"+
              "<td>"+a.full_name+"</td>"+
              "<td>"+a.py_code+"</td>"+
              "<td>"+a.tel+"</td>"+
              "<td>"+a.phone+"</td>";
              tb.appendChild(new_tr);
              }
            document.querySelector('#pop_up').addEventListener("dblclick",td.input_selected_des);
            document.querySelector('#pop_up').addEventListener("keypress",td.input_selected_des);
            }
            else alert("当前查询条件无结果");
          }
        }

          ajax_object.open("GET", "query.php?" + string, true);ajax_object.send();
          }
          )("query_multiple&q_columns_name=*&q_table=people&q_condition_column="+q_condition_column+"&q_condition_value="+that.innerHTML);

          //enter key event
          event.preventDefault();
          event.stopPropagation();
        }

  },

  // "query_multiple_products": function(event){
  //   if (event.keyCode == 13){
  //       var that = this;

  //       var q_condition_column;
  //       //判断是否是拼音或者汉子
  //       if (that.innerHTML.charCodeAt(0)>= 123 ||
  //           that.innerHTML.charCodeAt(0)<= 96)
  //         q_condition_column = "full_name";
  //       else
  //         q_condition_column = "py_code";

  //       (function query(string) 
  //       {
  //       var ajax_object;
  //       if (window.XMLHttpRequest) ajax_object = new XMLHttpRequest();
  //       else {/*code for IE6, IE5*/ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}
  //       ajax_object.onreadystatechange = function(){
  //         if (ajax_object.readyState === XMLHttpRequest.DONE && ajax_object.status === 200) 
    
  //         if(JSON.parse(ajax_object.response)) {
  //           //that, td 都可用，思考原因
  //           td.query_result = JSON.parse(ajax_object.response);
  //           p = document.querySelector('#pop_up');
  //           p.tabIndex = 12;
  //           //清楚pop中上一次查询结果
  //           p.innerHTML = "";

  //           // console.log("ajax");//test exec
  //           td.toggle_display.call(p);
  //           //t is #pop_pu->table
  //           var t = p.appendChild(document.createElement("table"));
  //           var tb = t.appendChild(document.createElement("tbody"));
  //           for(var j=0;j<td.query_result.length;j++){
  //             var a = td.query_result[j];
  //             var new_tr = document.createElement("tr");
  //             new_tr.addEventListener("mouseover", td.make_selection_single);
  //             new_tr.innerHTML = 
  //             "<td>"+(j+1)+"</td>"+
  //             "<td>"+a.id+"</td>"+
  //             "<td>"+a.full_name+"</td>"+
  //             "<td>"+a.py_code+"</td>"+
  //             "<td>1*"+a.admin_defined_unit_2_factor+"</td>"+
  //             "<td>"+a.user_comment+"</td>";
  //             tb.appendChild(new_tr);
  //             }
  //           }      
  //           else td.query_result = false;
  //         };

  //         ajax_object.open("GET", "query.php?" + string, true);ajax_object.send();
  //         }
  //         )("query_multiple&q_columns_name=*&q_table=people&q_condition_column="+q_condition_column+"&q_condition_value="+that.innerHTML);

  //         //enter key event
  //         event.preventDefault();
  //         event.stopPropagation();
  //       }

  // } 

  //"submitter"
  

};

function in_page_query (event){
  if(event.keyCode==13){
    var that = this;
    this.innerHTML = td.query_single_and_modify(that,"full_name","people","id="+this.innerHTML);
  
    event.preventDefault();
  }

}

document.querySelector("td[name='trading_object']").addEventListener("keypress", td.query_people);
document.querySelector("#creator").addEventListener("click", td.xs_creator);

document.addEventListener("keydown", td.esc_display);
td.viewer(1);
