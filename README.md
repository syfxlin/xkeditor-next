# XK-Editor (Next)

> 一个支持富文本和 Markdown 的编辑器

> 项目目前已经基本完善，后续将会用在 XK-Note（Next），不过今年要开始准备招聘了，项目可能会开坑了一直不写 2333。

![Author](https://img.shields.io/badge/Author-Otstar%20Lin-blue.svg?style=flat-square) ![License](https://img.shields.io/github/license/syfxlin/xkeditor.svg?style=flat-square)

## 简介 Introduction

`XK-Editor (Next)` = `TypeScript` + `React` + `Rich-markdown-editor`;

基于 [rich-markdown-editor](https://github.com/outline/rich-markdown-editor) 开发的编辑器，在其基础上添加了更多的模块，比如
Monaco Editor 对应的几个模块。更完善的模块设计，比如 Toolbar 和 BlockMenu 可以在模块中直接定义，无需再修改 Toolbar 或 BlockMenu
的代码，做到更好的解耦合。同时也完善了 React 组件模块，使其更方便的使用。同时由于 React 组件模块是使用 `ReadtDOM.render`
渲染的，会从主树中分离出来，造成主树更新的时候，这些分离树无法被同步更新，于是为其添加了观察者模式，当主树更新的时候重新渲染分离树。

## 文档 Doc

暂无

## 维护者 Maintainer

XK-Editor 由 [Otstar Lin](https://ixk.me/)
和下列 [贡献者](https://github.com/syfxlin/xkeditor-next/graphs/contributors) 的帮助下撰写和维护。

> Otstar Lin - [Personal Website](https://ixk.me/) · [Blog](https://blog.ixk.me/) · [Github](https://github.com/syfxlin)

## 许可证 License

![License](https://img.shields.io/github/license/syfxlin/xkeditor-next.svg?style=flat-square)

根据 Apache License 2.0 许可证开源。
