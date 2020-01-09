# iview-admin-table
 * 后台管理系统专用TABLE组件（基于view-desgin）
 *
 * 一、是如何来拆分的
 *  搜索栏区域：支持自定义搜索组件
 *  工具栏区域：支持自定义工具按钮
 *  主内容区域：支持表格、列表、卡片3种展现形式
 *  主内容分页：iView.Page组件，通过props.page配置
 *
 * 二、有哪些常规封装
 *  工具栏区域：
 *   1.添加按钮：通过props.insert配置
 *   2.导出：    通过props.exPort配置
 *   2.导入：    通过props.imPort配置
 *   3.多模式：  通过props.displayMode配置
 *   ...额外的： 通过props.toolbars配置
 *  主内容区域：
 *   1.添加子级：通过props.insertChild配置
 *   2.删除行：  通过props.remove配置
 *   3.修改行：  通过props.update配置
 *   4.查询数据：通过props.search配置
 *   ...额外的： 通过props.buttons配置
 *
 * @author zyl<733433@qq.com>
