var mode = 'null';

// jQuery doc ready 
$(function() {
    // Menu navigation for single page layout
    $('ul.navbar-nav li a').click(function() {
        // Highlight proper navbar item
        $('.nav li').removeClass('active');
        $(this).parent().addClass('active');
        
        // Show the proper menu div
        $('.mdiv').addClass('hidden');
        $($(this).attr('href')).removeClass('hidden');
        
        // Collapse the menu on smaller screens
        $('#navbar').removeClass('in').attr('aria-expanded', 'false');
        $('.navbar-toggle').attr('aria-expanded', 'false');

        $('#wserror').on('hidden.bs.modal', function() {
            location.reload();
        });

        // Firmware selection and upload
        $('#efu').change(function () {
            $('#updatefw').submit();
            $('#update').modal({backdrop: 'static', keyboard: false});
        });

        // Test mode toggles
        $('#tmode').change(function() {
            $('.tdiv').addClass('hidden');
            $('#'+$('select[name=tmode]').val()).removeClass('hidden');
        });

        // Color Picker
        $('.color').colorPicker({
            buildCallback: function($elm) {
                var colorInstance = this.color;
                var colorPicker = this;

                $elm.append('<div class="cp-memory">' +
                    '<div style="background-color: #FFFFFF";></div>' +
                    '<div style="background-color: #FF0000";></div>' +
                    '<div style="background-color: #00FF00";></div>' +
                    '<div style="background-color: #0000FF";></div>').
                on('click', '.cp-memory div', function(e) {
                    var $this = $(this);

                    if (this.className) {
                        $this.parent().prepend($this.prev()).children().eq(0).
                            css('background-color', '#' + colorInstance.colors.HEX);
                    } else {
                        colorInstance.setColor($this.css('background-color'));
                        colorPicker.render();
                    }
                });

                this.$colorPatch = $elm.prepend('<div class="cp-disp">').find('.cp-disp');
            },

            cssAddon:
                '.cp-memory {margin-bottom:6px; clear:both;}' +
                '.cp-memory div {float:left; width:25%; height:40px;' +
                'background:rgba(0,0,0,1); text-align:center; line-height:40px;}' +
                '.cp-disp{padding:10px; margin-bottom:6px; font-size:19px; height:40px; line-height:20px}' +
                '.cp-xy-slider{width:200px; height:200px;}' +
                '.cp-xy-cursor{width:16px; height:16px; border-width:2px; margin:-8px}' +
                '.cp-z-slider{height:200px; width:40px;}' +
                '.cp-z-cursor{border-width:8px; margin-top:-8px;}',

            opacity: false,

            renderCallback: function($elm, toggled) {
                var colors = this.color.colors.RND;
                var json = {
                        'r': colors.rgb.r,
                        'g': colors.rgb.g,
                        'b': colors.rgb.b
                    };

                this.$colorPatch.css({
                    backgroundColor: '#' + colors.HEX,
                    color: colors.RGBLuminance > 0.22 ? '#222' : '#ddd'
                }).text(this.color.toString($elm._colorMode)); // $elm.val();
                
                var tmode = $('#tmode option:selected').val();

                if (!tmode.localeCompare('t_static')) {
                    ws.send('T1' + JSON.stringify(json));
                }
                else if(!tmode.localeCompare('t_chase')) {
                    ws.send('T2' + JSON.stringify(json));
                }
            }
        });

        // Set page event feeds
        feed();
    });

    // DHCP field toggles
    $('#dhcp').click(function() {
        if ($(this).is(':checked')) {
            //$('.dhcp').prop('disabled', true);
            $('.dhcp').addClass('hidden');
       } else {
            //$('.dhcp').prop('disabled', false);
            $('.dhcp').removeClass('hidden');
       }
    });

    // MQTT field toggles
    $('#mqtt').click(function() {
        if ($(this).is(':checked')) {
            //$('.mqtt').prop('disabled', false);
            $('.mqtt').removeClass('hidden');
       } else {
            //$('.mqtt').prop('disabled', true);
            $('.mqtt').addClass('hidden');
       }
    });

    // Pixel type toggles
    $('#p_type').change(function() {
        if ($('select[name_type]').val() == '1')
            $('#p_color').prop('disabled', true);
        else
            $('#p_color').prop('disabled', false);
    });

    // Serial protocol toggles
    $('#s_proto').change(function() {
        if ($('select[name=s_proto]').val() == '0')
            $('#s_baud').prop('disabled', true);
        else 
            $('#s_baud').prop('disabled', false);
    });
    
    // Hostname, SSID, and Password validation
    $('#hostname').keyup(function() {
		wifiValidation();
    });
	$('#ssid').keyup(function() {
		wifiValidation();
    });
	$('#password').keyup(function() {
		wifiValidation();
    });
	$('#ap').change(function () {
		wifiValidation();
	});
	$('#dhcp').change(function () {
		wifiValidation();
	});
	$('#gateway').keyup(function () {
		wifiValidation();
	});
	$('#ip').keyup(function () {
		wifiValidation();
	});
	$('#netmask').keyup(function () {
		wifiValidation();
	});

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
});

function wifiValidation() {
	var WifiSaveDisabled = false;
	var re = /^([a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9\-.]*[a-zA-Z0-9.])$/;
	if (re.test($('#hostname').val()) && $('#hostname').val().length <= 255) {
		$('#fg_hostname').removeClass('has-error');
		$('#fg_hostname').addClass('has-success');
	} else {
		$('#fg_hostname').removeClass('has-success');
		$('#fg_hostname').addClass('has-error');
		WifiSaveDisabled = true
	}
	if ($('#ssid').val().length <= 32){
		$('#fg_ssid').removeClass('has-error');
		$('#fg_ssid').addClass('has-success');
	} else {
		$('#fg_ssid').removeClass('has-success');
		$('#fg_ssid').addClass('has-error');
		WifiSaveDisabled = true
	}
	if ($('#password').val().length <= 32){
		$('#fg_password').removeClass('has-error');
		$('#fg_password').addClass('has-success');
	} else {
		$('#fg_password').removeClass('has-success');
		$('#fg_password').addClass('has-error');
		WifiSaveDisabled = true
	}
	if ($('#dhcp').prop('checked')== false) {
		var iptest = new RegExp('' 
		+ /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\./.source
		+ /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\./.source
		+ /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\./.source
		+ /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.source
		);

		if (iptest.test($('#ip').val())) {
			$('#fg_ip').removeClass('has-error');
			$('#fg_ip').addClass('has-success');
		} else {
			$('#fg_ip').removeClass('has-success');
			$('#fg_ip').addClass('has-error');
			WifiSaveDisabled = true
		}
		if (iptest.test($('#netmask').val())) {
			$('#fg_netmask').removeClass('has-error');
			$('#fg_netmask').addClass('has-success');
		} else {
			$('#fg_netmask').removeClass('has-success');
			$('#fg_netmask').addClass('has-error');
			WifiSaveDisabled = true
		}
		if (iptest.test($('#gateway').val())) {
			$('#fg_gateway').removeClass('has-error');
			$('#fg_gateway').addClass('has-success');
		} else {
			$('#fg_gateway').removeClass('has-success');
			$('#fg_gateway').addClass('has-error');
			WifiSaveDisabled = true
		}
	}
	$('#btn_wifi').prop('disabled', WifiSaveDisabled);
}

// Page event feeds
function feed() {
    if ($('#home').is(':visible')) {
        ws.send('X1');
        ws.send('X2');
        ws.send('Xh');
        ws.send('XU');

        setTimeout(function() {
            feed();
        }, 1000);
    }
}

function param(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
}

// WebSockets
function wsConnect() {
    if ('WebSocket' in window) {
	if (target = param('target')) {
//		alert ('got target ' + target);
	} else {
		target = document.location.host;
	}
        // Open a new web socket and set the binary type
	ws = new WebSocket('ws://' + target + '/ws');
        ws.binaryType = 'arraybuffer';

        ws.onopen = function() {
            ws.send('E1'); // Get html elements
            ws.send('G1'); // Get Config
            ws.send('G2'); // Get Net Status

            feed();
        };
        
        ws.onmessage = function (event) {
            if(typeof event.data === "string") {
                var cmd = event.data.substr(0, 2);
                var data = event.data.substr(2);
                switch (cmd) {
                case 'E1':
                    getElements(data);
                    break;                
                case 'G1':
                    getConfig(data);
                    break;
                case 'G2':
                    getConfigStatus(data);
                    break;
                case 'S1':
                    setConfig(data);
                    reboot();
                    break;
                case 'S2':
                    setConfig(data);
                    break;
                case 'X1':
                    getRSSI(data);
                    break;
                case 'X2':
                    getE131Status(data);
                    break;
	        case 'Xh':
                    getHeap(data);
                    break;
                case 'XU':
                    getUptime(data);
                    break;
                case 'X6':
                    showReboot();
                    break;
                default:
                    console.log('Unknown Command: ' + event.data);
                    break;
                }
            } else {
                streamData= new Uint8Array(event.data);
                drawStream(streamData);
                if (!$('#tmode option:selected').val().localeCompare('t_view')) ws.send('T4');
            }
        };
        
        ws.onerror = function() {
            $('#wserror').modal({backdrop: 'static', keyboard: false});
        };

        ws.onclose = function() { 
            $('#wserror').modal({backdrop: 'static', keyboard: false});
        };
    } else {
        alert('WebSockets is NOT supported by your Browser! You will need to upgrade your browser.');
    }
}

function drawStream(streamData) {
    var cols=parseInt($('#v_columns').val());
    var size=Math.floor((canvas.width-20)/cols);
    if($("input[name='viewStyle'][value='RGB']").prop('checked')) {
        maxDisplay=Math.min(streamData.length, (cols*Math.floor((canvas.height-30)/size))*3);
        for (i = 0; i < maxDisplay; i+=3) {
            ctx.fillStyle='rgb(' + streamData[i+0] + ',' + streamData[i+1] + ',' + streamData[i+2] + ')';
            var col=(i/3)%cols;
            var row=Math.floor((i/3)/cols);
            ctx.fillRect(10+(col*size),10+(row*size),size-1,size-1);
        }
    } else {
        maxDisplay=Math.min(streamData.length, (cols*Math.floor((canvas.height-30)/size)));
        for (i = 0; i < maxDisplay; i++) {
            ctx.fillStyle='rgb(' + streamData[i] + ',' + streamData[i] + ',' + streamData[i] + ')';
            var col=(i)%cols;
            var row=Math.floor(i/cols);
            ctx.fillRect(10+(col*size),10+(row*size),size-2,size-2);
        }
    }
    if(streamData.length>maxDisplay) {
        ctx.fillStyle='rgb(204,0,0)';
        ctx.fillRect(0,canvas.height-25,canvas.width,25);
        ctx.fillStyle='rgb(255,255,255)';
        ctx.fillText("Increase number of columns to show all data" , (canvas.width/2), canvas.height-5);
    }

}

function clearStream() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getElements(data) {
    var elements = JSON.parse(data);

    for (var i in elements) {
        for (var j in elements[i]) {
            var opt = document.createElement('option');
            opt.text = j;
            opt.value = elements[i][j];
            document.getElementById(i).add(opt);
        }
    }
}

function getConfig(data) {
    var config = JSON.parse(data);

    // Device and Network config
    $('#title').text('WifiMIDI - ' + config.device.id);
    $('#name').text(config.device.id);
    $('#devid').val(config.device.id);
    $('#ssid').val(config.network.ssid);
    $('#password').val(config.network.passphrase);
    $('#hostname').val(config.network.hostname);
    $('#dhcp').prop('checked', config.network.dhcp);
    if (config.network.dhcp) {
        $('.dhcp').addClass('hidden');
    } else {
        $('.dhcp').removeClass('hidden');
    }
    //$('.dhcp').prop('disabled', config.network.dhcp);
    $('#ap').prop('checked', config.network.ap_fallback);
    $('#ip').val(config.network.ip[0] + '.' +
            config.network.ip[1] + '.' +
            config.network.ip[2] + '.' +
            config.network.ip[3]);
    $('#netmask').val(config.network.netmask[0] + '.' +
            config.network.netmask[1] + '.' +
            config.network.netmask[2] + '.' +
            config.network.netmask[3]);
    $('#gateway').val(config.network.gateway[0] + '.' +
            config.network.gateway[1] + '.' +
            config.network.gateway[2] + '.' +
            config.network.gateway[3]);

    // MQTT Config
    $('#mqtt').prop('checked', config.mqtt.enabled);
    if (config.mqtt.enabled) {
        $('.mqtt').removeClass('hidden');
    } else {
        $('.mqtt').addClass('hidden');
    }
    //$('.mqtt').prop('disabled', !config.mqtt.enabled);
    $('#mqtt_ip').val(config.mqtt.ip);
    $('#mqtt_port').val(config.mqtt.port);
    $('#mqtt_user').val(config.mqtt.user);
    $('#mqtt_password').val(config.mqtt.password);
    $('#mqtt_topic').val(config.mqtt.topic);
    
    // E1.31 Config
    $('#universe').val(config.e131.universe);
    $('#channel_start').val(config.e131.channel_start);
    $('#multicast').prop('checked', config.e131.multicast);

    // Output Config
    $('.odiv').addClass('hidden');
    if (config.device.mode === 0) {  // Pixel
        mode = 'pixel';
        $('#o_pixel').removeClass('hidden');
        $('#p_count').val(config.e131.channel_count / 3);
        $('#p_type').val(config.pixel.type);
        $('#p_color').val(config.pixel.color);
        $('#p_gamma').prop('checked', config.pixel.gamma);
        
        if(config.e131.channel_count / 3 <8 ) {
            $('#v_columns').val(config.e131.channel_count / 3);
        } else if (config.e131.channel_count / 3 <50 ) {
            $('#v_columns').val(10);
        } else {
            $('#v_columns').val(25);
        }
        $("input[name='viewStyle'][value='RGB']").trigger('click');
		clearStream();
        
        // Trigger updated elements
        $('#p_type').trigger('click');
        $('#p_count').trigger('change');
    }

    if (config.device.mode == 1) {  // Serial
        mode = 'serial';
        $('#o_serial').removeClass('hidden');
        $('#s_count').val(config.e131.channel_count);
        $('#s_proto').val(config.serial.type);
        $('#s_baud').val(config.serial.baudrate);
        
        if (config.e131.channel_count<=64 ) {
            $('#v_columns').val(8);
        } else {
            $('#v_columns').val(16);
        }
        $("input[name='viewStyle'][value='Channel']").trigger('click');
		clearStream();

        // Trigger updated elements
        $('#s_proto').trigger('click');
        $('#s_count').trigger('change');
    }
}

function getConfigStatus(data) {
    var status = JSON.parse(data);
    
    $('#x_ssid').text(status.ssid);
    $('#x_hostname').text(status.hostname);
    $('#x_ip').text(status.ip);
    $('#x_mac').text(status.mac);
    $('#x_version').text(status.version);
    $('#x_flashchipid').text(status.flashchipid);
    $('#x_usedflashsize').text(status.usedflashsize);
    $('#x_realflashsize').text(status.realflashsize);
    $('#x_freeheap').text(status.freeheap);
}

function getRSSI(data) {
    var rssi = +data;
    var quality = 2 * (rssi + 100);

    if (rssi <= -100)
        quality = 0;
    else if (rssi >= -50)
        quality = 100;

    $('#x_rssi').text(rssi);
    $('#x_quality').text(quality);
}

function getHeap(data) {
    var heap = +data;

    $('#x_freeheap').text(heap);
}

function getUptime(data) {
    var date = new Date(+data);
    var str = '';

    str += Math.floor(date.getTime()/86400000) + " days, ";
    str += ("0" + date.getUTCHours()).slice(-2) + ":";
    str += ("0" + date.getUTCMinutes()).slice(-2) + ":";
    str += ("0" + date.getUTCSeconds()).slice(-2);
    $('#x_uptime').text(str);
}

function getE131Status(data) {
    var status = data.split(':');
   
    $('#uni_first').text(status[0]);
    $('#uni_last').text(status[1]);
    $('#pkts').text(status[2]);
    $('#serr').text(status[3]);
    $('#perr').text(status[4]);
    $('#clientip').text(status[5]);
    $('#clientport').text(status[6]);
}

function snackSave() {
    // Show snackbar for 3sec
    var x = document.getElementById('snackbar');
    x.className = 'show';
    setTimeout(function(){
        x.className = x.className.replace('show', ''); 
    }, 3000);    
}

function setConfig() {
    // Get config to refresh UI and show result
    ws.send("G1");
    snackSave();
}

function submitWiFi() {
    var ip = $('#ip').val().split('.');
    var netmask = $('#netmask').val().split('.');
    var gateway = $('#gateway').val().split('.');

    var json = {
            'network': {
                'ssid': $('#ssid').val(),
                'passphrase': $('#password').val(),
                'hostname': $('#hostname').val(),
                'ip': [parseInt(ip[0]), parseInt(ip[1]), parseInt(ip[2]), parseInt(ip[3])],
                'netmask': [parseInt(netmask[0]), parseInt(netmask[1]), parseInt(netmask[2]), parseInt(netmask[3])],
                'gateway': [parseInt(gateway[0]), parseInt(gateway[1]), parseInt(gateway[2]), parseInt(gateway[3])],
                'dhcp': $('#dhcp').prop('checked'),
                'ap_fallback': $('#ap').prop('checked')
            }
        };
    ws.send('S1' + JSON.stringify(json));
}

function submitConfig() {
    var channels = parseInt($('#s_count').val());
    if (mode == 'pixel')
        channels = parseInt($('#p_count').val()) * 3;

    var json = {
            'device': {
                'id': $('#devid').val()
            },
            'mqtt': {
                'enabled': $('#mqtt').prop('checked'),
                'ip': $('#mqtt_ip').val(),
                'port': $('#mqtt_port').val(),
                'user': $('#mqtt_user').val(),
                'password': $('#mqtt_password').val(),
                'topic': $('#mqtt_topic').val()
            },
            'e131': {
                'universe': parseInt($('#universe').val()),
                'channel_start': parseInt($('#channel_start').val()),
                'channel_count': channels,
                'multicast': $('#multicast').prop('checked')
            },
            'pixel': {
                'type': parseInt($('#p_type').val()),
                'color': parseInt($('#p_color').val()),
                'gamma': $('#p_gamma').prop('checked')
            },
            'serial': {
                'type': parseInt($('#s_proto').val()),
                'baudrate': parseInt($('#s_baud').val())
            }
        };
    ws.send('S2' + JSON.stringify(json));
}

function refreshPixel() {
    var proto = $('#p_type option:selected').text();    
    var size = parseInt($('#p_count').val());
    var frame = 30;
    var idle = 300;

    if (!proto.localeCompare('WS2811 800kHz')) {
        frame = 30;
        idle = 300;
    } else if (!proto.localeCompare('GE Color Effects')) {
        frame = 790;
        idle = 35;
    }

    var rate = (frame * size + idle) / 1000;
    var hz = 1000 / rate;
    $('#refresh').html(Math.ceil(rate) + 'ms / ' + Math.floor(hz) + 'Hz');
}

function refreshSerial() {
    var proto = $('#s_proto option:selected').text();
    var baud = parseInt($('#s_baud').val());
    var size = parseInt($('#s_count').val());
    var symbol = 11;
    if (!proto.localeCompare('Renard')) {
        symbol = 10;
        size = size + 2;
    } else if (!proto.localeCompare('DMX512')) {
        symbol = 11;
        baud = 250000;
        $('#s_baud').val(baud);
    }
    var rate = symbol * 1000 / baud * size;
    var hz = 1000 / rate;
    $('#refresh').html(Math.ceil(rate) + 'ms / ' + Math.floor(hz) + 'Hz');
}

function test() {
    var tmode = $('#tmode option:selected').val();

    if (!tmode.localeCompare('t_disabled')) {
        ws.send('T0');
    }
    else if (!tmode.localeCompare('t_rainbow')) {
        ws.send('T3');
    }
    else if (!tmode.localeCompare('t_view')) {
        ws.send('T4');
    }
}

function showReboot() {
    $('#update').modal('hide');
    $('#reboot').modal({backdrop: 'static', keyboard: false});
    setTimeout(function() {
        if($('#dhcp').prop('checked')) {
            window.location.assign("/");
        } else {
            window.location.assign("http://" + $('#ip').val());
        }
    }, 5000);    
}

function reboot() {
    showReboot();
    ws.send('X6');
}
