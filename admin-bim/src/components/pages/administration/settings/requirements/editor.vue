<template>
    <div class="pa-2 d-flex flex-column">
        <div class="d-flex flex-row align-center flex-wrap gap editable" v-if="editor">

            <v-btn-toggle>
                <v-btn small @click="editor.chain().focus().toggleBold().run()" :disabled="!editor.can().chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
                  <v-icon>mdi-format-bold</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleItalic().run()" :disabled="!editor.can().chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
                  <v-icon>mdi-format-italic</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }">
                  <v-icon>mdi-format-underline</v-icon>
                </v-btn>
            </v-btn-toggle>

            <v-item-group class="v-btn-toggle">
                <v-btn small @click="editor.chain().focus().unsetAllMarks().run()">
                    <v-icon>mdi-format-clear</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().clearNodes().run()">
                    <v-icon>mdi-broom</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().setHardBreak().run()">
                    <v-icon>mdi-format-pilcrow</v-icon>
                </v-btn>
            </v-item-group>

            <v-item-group class="v-btn-toggle">
                <v-btn small @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
                    <v-icon>mdi-format-paragraph</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
                    <v-icon>mdi-format-header-1</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
                    <v-icon>mdi-format-header-2</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
                    <v-icon>mdi-format-header-3</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleHeading({ level: 4 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
                    <v-icon>mdi-format-header-4</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleHeading({ level: 5 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
                    <v-icon>mdi-format-header-5</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleHeading({ level: 6 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
                    <v-icon>mdi-format-header-6</v-icon>
                </v-btn>
            </v-item-group>

            <v-btn-toggle>
                <v-btn small @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
                    <v-icon>mdi-format-list-bulleted</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
                    <v-icon>mdi-format-list-numbered</v-icon>
                </v-btn>
            </v-btn-toggle>

                
            <v-item-group class="v-btn-toggle">
                <v-btn small @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
                    <v-icon>mdi-undo</v-icon>
                </v-btn>
                <v-btn small @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
                    <v-icon>mdi-redo</v-icon>
                </v-btn>
            </v-item-group>

            <v-item-group class="v-btn-toggle">
                <v-btn small  @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
                    <v-icon>mdi-table</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().deleteTable().run()">
                    <v-icon>mdi-table-remove</v-icon>
                </v-btn>
            </v-item-group>

            <v-item-group class="v-btn-toggle">
                <v-btn small  @click="editor.chain().focus().addColumnBefore().run()">
                    <v-icon>mdi-table-column-plus-before</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().addColumnAfter().run()">
                    <v-icon>mdi-table-column-plus-after</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().deleteColumn().run()">
                    <v-icon>mdi-table-column-remove</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().addRowBefore().run()">
                    <v-icon>mdi-table-row-plus-before</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().addRowAfter().run()">
                    <v-icon>mdi-table-row-plus-after</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().deleteRow().run()">
                    <v-icon>mdi-table-row-remove</v-icon>
                </v-btn>
            </v-item-group>
            
            <v-item-group class="v-btn-toggle">
                <v-btn small  @click="editor.chain().focus().mergeCells().run()">
                    <v-icon>mdi-table-merge-cells</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().splitCell().run()">
                    <v-icon>mdi-table-split-cell</v-icon>
                </v-btn>
                <v-btn small  @click="editor.chain().focus().toggleHeaderCell().run()">
                    <v-icon>mdi-table-headers-eye</v-icon>
                </v-btn>
            </v-item-group>

                <v-btn small @click="addImage">
                    <v-icon>mdi-image-outline</v-icon>
                </v-btn>
            </div>
            <editor-content 
            class="editable editorborder pa-2 mt-3" 
            :editor="editor" 
            @update="consolelog($event)"
            />
            
        </div>
  </template>
  
  <script>

import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Image from '@tiptap/extension-image'

export default {
  components: {
    EditorContent,
  },
  props: {
        propset: { default: {}, type: Object, },
  },
  data() {
    return {
      editor: null,
    }
  },

  methods: {
    addImage() {
      const url = window.prompt('URL')

      if (url) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
    },
    updatedatav2(propname, val) {
            let type = 'Editor'
            this.$emit('updatedatav2', {type: type, prop: propname, value: val})
    },
  },

  mounted() {
    this.editor = new Editor({
      content: this.propset.description || '...',
      extensions: [
        StarterKit,
        Underline,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Image,
      ],
    })
    this.editor.on('blur', ({ editor }) => {
      this.updatedatav2('description', this.editor.getHTML())
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style scoped>

.gap {
  row-gap: 5px;
  column-gap: 12px; 
}

::v-deep table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #ced4da;
}

::v-deep .ProseMirror table {
	border-collapse: collapse;
	table-layout: fixed;
	width: 100%;
	margin: 0;
	overflow: hidden;
}
::v-deep .ProseMirror table td, .ProseMirror table th {
	min-width: 1em;
	border: 2px solid #ced4da;
	padding: 3px 5px;
	vertical-align: top;
	box-sizing: border-box;
	position: relative;
}
::v-deep .ProseMirror table td > *, .ProseMirror table th > * {
	margin-bottom: 0;
}
::v-deep .ProseMirror table th {
	font-weight: bold;
	text-align: left;
	background-color: #f1f3f5;
}
::v-deep .ProseMirror table .selectedCell:after {
	z-index: 2;
	position: absolute;
	content: "";
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(200, 200, 255, 0.4);
	pointer-events: none;
}
::v-deep .ProseMirror table .column-resize-handle {
  position: absolute;
	right: -2px;
	top: 0;
	bottom: -2px;
	width: 4px;
	background-color: #adf;
	pointer-events: none;
}
::v-deep .ProseMirror table p {
	margin: 0;
}
::v-deep .tableWrapper {
	padding: 1rem 0;
	overflow-x: auto;
}
::v-deep .resize-cursor {
	cursor: ew-resize;
	cursor: col-resize;
}

::v-deep .ProseMirror > * + * {
	margin-top: 0.75em;
}
::v-deep .ProseMirror img {
	max-width: 100%;
	height: auto;
}
::v-deep .ProseMirror img.ProseMirror-selectednode {
	outline: 3px solid #68cef8;
}

.editorborder {
  border-radius: 5px;
  min-height: 200px;
  border: solid 2px grey; 
}
 
::v-deep .ProseMirror:focus {
    outline: none;
}

</style>