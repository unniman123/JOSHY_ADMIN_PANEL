import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Type, Palette } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      Image,
      TextStyle,
      FontFamily,
      Color,
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const fontFamilies = [
    { name: 'Default', value: 'default' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { name: 'Impact', value: 'Impact, sans-serif' },
  ];

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || '';
  const currentColor = editor.getAttributes('textStyle').color || '';

  const colorOptions = [
    { name: 'Default', value: '', color: 'transparent' },
    { name: 'Black', value: '#000000', color: '#000000' },
    { name: 'White', value: '#ffffff', color: '#ffffff' },
    { name: 'Red', value: '#ef4444', color: '#ef4444' },
    { name: 'Blue', value: '#3b82f6', color: '#3b82f6' },
    { name: 'Green', value: '#22c55e', color: '#22c55e' },
    { name: 'Yellow', value: '#eab308', color: '#eab308' },
    { name: 'Purple', value: '#a855f7', color: '#a855f7' },
    { name: 'Orange', value: '#f97316', color: '#f97316' },
    { name: 'Gray', value: '#6b7280', color: '#6b7280' },
    { name: 'Pink', value: '#ec4899', color: '#ec4899' },
    { name: 'Teal', value: '#14b8a6', color: '#14b8a6' },
  ];

  const handleColorChange = (color: string) => {
    if (color === '') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="flex gap-2 p-2 border-b bg-muted/50">
        <Select
          value={currentFontFamily || 'default'}
          onValueChange={(value) => {
            if (value === 'default') {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(value).run();
            }
          }}
        >
          <SelectTrigger className="w-[180px] h-8">
            <Type className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value === 'default' ? 'inherit' : font.value }}
              >
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="relative"
            >
              <Palette className="h-4 w-4" />
              {currentColor && (
                <div
                  className="absolute bottom-1 right-1 w-3 h-3 rounded border border-white"
                  style={{ backgroundColor: currentColor }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <div className="text-sm font-medium">Text Color</div>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                      currentColor === colorOption.value
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-muted'
                    }`}
                    style={{
                      backgroundColor: colorOption.color,
                      borderColor: currentColor === colorOption.value ? 'currentColor' : undefined
                    }}
                    onClick={() => handleColorChange(colorOption.value)}
                    title={colorOption.name}
                  />
                ))}
              </div>
              <div className="pt-2 border-t">
                <label className="text-sm font-medium">Custom Color</label>
                <input
                  type="color"
                  className="w-full h-8 mt-1 rounded border cursor-pointer"
                  value={currentColor.startsWith('#') ? currentColor : '#000000'}
                  onChange={(e) => handleColorChange(e.target.value)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
