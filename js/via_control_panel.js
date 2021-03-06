/**
 *
 * @class
 * @classdesc VIA Control Panel
 * @author Abhishek Dutta <adutta@robots.ox.ac.uk>
 * @date 16 May 2019
 *
 */

function _via_control_panel(control_panel_container, via) {
  this._ID = '_via_control_panel_';
  this.c = control_panel_container;
  this.via = via;

  // registers on_event(), emit_event(), ... methods from
  // _via_event to let this module listen and emit events
  _via_event.call(this);

  this._init();
}

_via_control_panel.prototype._init = function (type) {
  this.c.innerHTML = '';

  var logo_panel = document.createElement('div');
  logo_panel.setAttribute('class', 'logo');
  logo_panel.innerHTML = '<a href="https://youtu.be/dQw4w9WgXcQ" title="Сайт компанії" target="_blank">OMEGA</a>'
  this.c.appendChild(logo_panel);

  this.c.appendChild(this.via.vm.c);
  this._add_view_manager_tools();

  this._add_spacer();

  this._add_project_tools();

  this._add_spacer();

  this._add_region_shape_selector();

  this._add_spacer();

  var editor = _via_util_get_svg_button('micon_insertcomment', 'Редактор міток');
  editor.addEventListener('click', function () {
    this.emit_event('editor_toggle', {});
  }.bind(this));
  this.c.appendChild(editor);

  this._add_spacer();

  if (document.getElementById('micon_zoomin')) {
    var zoom = _via_util_get_svg_button('micon_zoomin', 'Приближення');
    zoom.addEventListener('click', function () {
      this.emit_event('zoom_toggle', {});
    }.bind(this));
    this.c.appendChild(zoom);
    this._add_spacer();
  }

  this._add_project_share_tools();

  this._add_spacer();

  var keyboard = _via_util_get_svg_button('micon_keyboard', 'Гарячі клавіші');
  keyboard.addEventListener('click', function () {
    _via_util_page_show('page_keyboard_shortcut');
  }.bind(this));
  this.c.appendChild(keyboard);

  var help = _via_util_get_svg_button('micon_help', 'About VIA');
  help.addEventListener('click', function () {
    _via_util_page_show('page_about');
  }.bind(this));
  this.c.appendChild(help);
}

_via_control_panel.prototype._add_spacer = function () {
  var spacer = document.createElement('div');
  spacer.setAttribute('class', 'spacer');
  this.c.appendChild(spacer);
}

_via_control_panel.prototype._add_view_manager_tools = function () {
  var prev_view = _via_util_get_svg_button('micon_navigate_prev', 'Попередній файл', 'show_prev');
  prev_view.addEventListener('click', this.via.vm._on_prev_view.bind(this.via.vm));
  this.c.appendChild(prev_view);

  var next_view = _via_util_get_svg_button('micon_navigate_next', 'Наступний файл', 'show_next');
  next_view.addEventListener('click', this.via.vm._on_next_view.bind(this.via.vm));
  this.c.appendChild(next_view);


  var del_view = _via_util_get_svg_button('micon_remove_circle', '!!! Видалити поточний файл', 'remove_media');
  del_view.addEventListener('click', this.via.vm._on_del_view.bind(this.via.vm));
  this.c.appendChild(del_view);
}

_via_control_panel.prototype._add_region_shape_selector = function () {
  if (document.getElementById('shape_point') === null) {
    return;
  }

  var rect = _via_util_get_svg_button('shape_rectangle', 'Прямокутник', 'RECTANGLE');
  rect.addEventListener('click', function () {
    this._set_region_shape('RECTANGLE');
  }.bind(this));
  this.c.appendChild(rect);

  var extreme_rect = _via_util_get_svg_button('shape_extreme_rectangle', 'Прямокутник2', 'EXTREME_RECTANGLE');
  extreme_rect.classList.add('shape_selector');
  extreme_rect.addEventListener('click', function () {
    this._set_region_shape('EXTREME_RECTANGLE');
  }.bind(this));
  this.c.appendChild(extreme_rect);

  this.shape_selector_list = { 'RECTANGLE': rect, 'EXTREME_RECTANGLE': extreme_rect };
}

_via_control_panel.prototype._set_region_shape = function (shape) {
  this.emit_event('region_shape', { 'shape': shape });
  for (var si in this.shape_selector_list) {
    if (si === shape) {
      this.shape_selector_list[si].classList.add('svg_button_selected');
    } else {
      this.shape_selector_list[si].classList.remove('svg_button_selected');
    }
  }
}

_via_control_panel.prototype._add_project_tools = function () {
  var load = _via_util_get_svg_button('micon_open', 'Відкрити проект');
  load.addEventListener('click', function () {
    _via_util_file_select_local(_VIA_FILE_SELECT_TYPE.JSON, this._project_load_on_local_file_select.bind(this), false);
  }.bind(this));
  this.c.appendChild(load);

  var save = _via_util_get_svg_button('micon_save', 'Зберегти проект');
  save.addEventListener('click', function () {
    this.via.d.project_save();
  }.bind(this));
  this.c.appendChild(save);
}

_via_control_panel.prototype._page_show_import_export = function (d) {
  var action_map = {
    'via_page_button_import': this._page_on_action_import.bind(this),
    'via_page_button_export': this._page_on_action_export.bind(this),
  }
  _via_util_page_show('page_import_export', action_map);
}

_via_control_panel.prototype._page_on_action_import = function (d) {
  if (d._action_id === 'via_page_button_import') {
    if (d.via_page_import_pid !== '') {
      this.via.s._project_pull(d.via_page_import_pid).then(function (remote_rev) {
        try {
          var project = JSON.parse(remote_rev);
          // clear remote project identifiers
          project.project.pid = _VIA_PROJECT_ID_MARKER;
          project.project.rev = _VIA_PROJECT_REV_ID_MARKER;
          project.project.rev_timestamp = _VIA_PROJECT_REV_TIMESTAMP_MARKER;
          this.via.d.project_load_json(project);
        }
        catch (e) {
          _via_util_msg_show('Malformed response from server: ' + e);
        }
      }.bind(this), function (err) {
        _via_util_msg_show(err + ': ' + d.via_page_import_pid);
      }.bind(this));
      return;
    }

    if (d.via_page_import_via2_project_json.length === 1) {
      _via_util_load_text_file(d.via_page_import_via2_project_json[0],
        this._project_import_via2_on_local_file_read.bind(this)
      );
      return;
    }
    _via_util_msg_show('To import an existing shared project, you must enter its project-id.');
  }
}

_via_control_panel.prototype._page_on_action_export = function (d) {
  if (d._action_id === 'via_page_button_export') {
    this.via.ie.export_to_file(d.via_page_export_format);
  }
}

_via_control_panel.prototype._project_load_on_local_file_select = function (e) {
  if (e.target.files.length === 1) {
    _via_util_load_text_file(e.target.files[0], this._project_load_on_local_file_read.bind(this));
  }
}

_via_control_panel.prototype._project_load_on_local_file_read = function (project_data_str) {
  this.via.d.project_load(project_data_str);
}

_via_control_panel.prototype._project_import_via2_on_local_file_read = function (project_data_str) {
  this.via.d.project_import_via2_json(project_data_str);
}

_via_control_panel.prototype._add_project_share_tools = function () {
  if (this.via.s) {

  }
}

_via_control_panel.prototype._share_show_info = function () {
  if (this.via.d.project_is_remote()) {
    this.via.s.exists(this.via.d.store.project.pid).then(function () {
      this.via.s._project_pull(this.via.d.store.project.pid).then(function (ok) {
        try {
          var d = JSON.parse(ok);
          var remote_rev_timestamp = new Date(parseInt(d.project.rev_timestamp));
          var local_rev_timestamp = new Date(parseInt(this.via.d.store.project.rev_timestamp));

          var pinfo = '<table>';
          pinfo += '<tr><td>Project Id</td><td>' + d.project.pid + '</td></tr>';
          pinfo += '<tr><td>Remote Revision</td><td>' + d.project.rev + ' (' + remote_rev_timestamp.toUTCString() + ')</td></tr>';
          pinfo += '<tr><td>Local Revision</td><td>' + this.via.d.store.project.rev + ' (' + local_rev_timestamp.toUTCString() + ')</td></tr>';
          pinfo += '</table>';
          if (d.project.rev !== this.via.d.store.project.rev) {
            pinfo += '<p>Your version of this project is <span style="color:red;">old</span>. Press <svg class="svg_icon" onclick="" viewbox="0 0 24 24"><use xlink:href="#micon_download"></use></svg> to fetch the most recent version of this project.</p>';
          } else {
            pinfo += '<p>You already have the <span style="color:blue;">latest</span> revision of this project.</p>';
          }

          document.getElementById('via_page_share_project_info').innerHTML = pinfo;
          document.getElementById('via_page_share_project_id').innerHTML = d.project.pid;
          _via_util_page_show('page_share_already_shared');
        }
        catch (e) {
          console.log(e)
          _via_util_msg_show('Malformed server response.' + e);
        }
      }.bind(this), function (pull_err) {
        _via_util_msg_show('Failed to pull project.');
        console.warn(pull_err);
      }.bind(this));
    }.bind(this), function (exists_err) {
      _via_util_page_show('page_share_not_shared_yet');
      console.warn(exists_err);
    }.bind(this));
  } else {
    _via_util_page_show('page_share_not_shared_yet');
  }
}

_via_control_panel.prototype._share_show_pull = function () {
  if (this.via.d.project_is_remote()) {
    // check if remote project has newer version
    this.via.s._project_pull(this.via.d.store.project.pid).then(function (ok) {
      try {
        var d = JSON.parse(ok);
        if (d.project.rev === this.via.d.store.project.rev) {
          _via_util_msg_show('You already have the latest revision of this project');
          return;
        } else {
          this.via.d.project_merge_rev(d);
        }
      }
      catch (e) {
        _via_util_msg_show('Malformed response from server.');
        console.warn(e);
      }
    }.bind(this), function (err) {
      _via_util_msg_show('Failed to pull project.');
      console.warn(err);
    }.bind(this));
  } else {
    var action_map = {
      'via_page_button_open_shared': this._page_on_action_open_shared.bind(this),
    }
    _via_util_page_show('page_share_open_shared', action_map);
  }
}

_via_control_panel.prototype._page_on_action_open_shared = function (d) {
  if (d._action_id === 'via_page_button_open_shared') {
    this.via.s.pull(d.via_page_input_pid);
  }
}

_via_control_panel.prototype._page_on_action_fileuri_bulk_add = function (d) {
  if (d.via_page_fileuri_urilist.length) {
    this.fileuri_bulk_add_from_url_list(d.via_page_fileuri_urilist);
  }

  if (d.via_page_fileuri_importfile.length === 1) {
    switch (parseInt(d.via_page_fileuri_filetype)) {
      case _VIA_FILE_TYPE.IMAGE:
        _via_util_load_text_file(d.via_page_fileuri_importfile[0], this.fileuri_bulk_add_image_from_file.bind(this));
        break;
      case _VIA_FILE_TYPE.AUDIO:
        _via_util_load_text_file(d.via_page_fileuri_importfile[0], this.fileuri_bulk_add_audio_from_file.bind(this));
        break;
      case _VIA_FILE_TYPE.VIDEO:
        _via_util_load_text_file(d.via_page_fileuri_importfile[0], this.fileuri_bulk_add_video_from_file.bind(this));
        break;
      default:
        _via_util_load_text_file(d.via_page_fileuri_importfile[0], this.fileuri_bulk_add_auto_from_file.bind(this));
    }

  }
}

_via_control_panel.prototype.fileuri_bulk_add_image_from_file = function (uri_list_str) {
  this.fileuri_bulk_add_from_url_list(uri_list_str, _VIA_FILE_TYPE.IMAGE);
}

_via_control_panel.prototype.fileuri_bulk_add_audio_from_file = function (uri_list_str) {
  this.fileuri_bulk_add_from_url_list(uri_list_str, _VIA_FILE_TYPE.AUDIO);
}

_via_control_panel.prototype.fileuri_bulk_add_video_from_file = function (uri_list_str) {
  this.fileuri_bulk_add_from_url_list(uri_list_str, _VIA_FILE_TYPE.VIDEO);
}

_via_control_panel.prototype.fileuri_bulk_add_auto_from_file = function (uri_list_str) {
  this.fileuri_bulk_add_from_url_list(uri_list_str, 0);
}

_via_control_panel.prototype.fileuri_bulk_add_from_url_list = function (uri_list_str, type) {
  var uri_list = uri_list_str.split('\n');
  if (uri_list.length) {
    var filelist = [];
    for (var i = 0; i < uri_list.length; ++i) {
      if (uri_list[i] === '' ||
        uri_list[i] === ' ' ||
        uri_list[i] === '\n'
      ) {
        continue; // skip
      }
      var filetype;
      if (type === 0 || typeof (type) === 'undefined') {
        filetype = _via_util_infer_file_type_from_filename(uri_list[i]);
      } else {
        filetype = type;
      }

      filelist.push({
        'fname': uri_list[i],
        'type': filetype,
        'loc': _via_util_infer_file_loc_from_filename(uri_list[i]),
        'src': uri_list[i],
      });
    }
    this.via.vm._file_add_from_filelist(filelist);
  }
}
