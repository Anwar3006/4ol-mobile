import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

interface SerializedLexicalNode {
  type: string;
  version: number;
  children?: SerializedLexicalNode[];
  text?: string;
  format?: number;
  style?: string;
  detail?: number;
  mode?: string;
  url?: string;
  direction?: string;
  level?: number;
  listType?: 'bullet' | 'number';
  value?: number;
  tag?: string;
}

interface LexicalRendererProps {
  nodes: SerializedLexicalNode[] | undefined;
}

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

export const LexicalRenderer: React.FC<LexicalRendererProps> = ({ nodes }) => {
  if (!nodes) return null;

  return (
    <>
      {nodes.map((node, index) => (
        <LexicalNodeRenderer key={index} node={node} />
      ))}
    </>
  );
};

const LexicalNodeRenderer: React.FC<{ node: SerializedLexicalNode }> = ({ node }) => {
  const renderChildren = () => {
    if (!node.children) return null;
    return node.children.map((child, index) => (
      <LexicalNodeRenderer key={index} node={child} />
    ));
  };

  const decodeFormat = (format: number = 0) => {
    return {
      isBold: !!(format & IS_BOLD),
      isItalic: !!(format & IS_ITALIC),
      isUnderline: !!(format & IS_UNDERLINE),
      isStrikethrough: !!(format & IS_STRIKETHROUGH),
      isCode: !!(format & IS_CODE),
    };
  };

  switch (node.type) {
    case 'root':
      return <View style={styles.root}>{renderChildren()}</View>;

    case 'paragraph':
      return (
        <Text style={[styles.paragraph, { textAlign: (node.direction as any) || 'left' }]}>
          {renderChildren()}
        </Text>
      );

    case 'heading': {
      const headingStyles = [
        styles.heading,
        node.tag === 'h1' && styles.h1,
        node.tag === 'h2' && styles.h2,
        node.tag === 'h3' && styles.h3,
      ];
      return <Text style={headingStyles}>{renderChildren()}</Text>;
    }

    case 'list':
      return <View style={styles.list}>{renderChildren()}</View>;

    case 'listitem': {
      const isBullet = (node as any).listType === 'bullet' || true; // Default to bullet for now
      return (
        <View style={styles.listItem}>
          <Text style={styles.bullet}>{isBullet ? '• ' : `${(node as any).value || 1}. `}</Text>
          <Text style={styles.listItemContent}>{renderChildren()}</Text>
        </View>
      );
    }

    case 'text': {
      const { isBold, isItalic, isUnderline, isStrikethrough, isCode } = decodeFormat(node.format);
      return (
        <Text
          style={[
            isBold && styles.bold,
            isItalic && styles.italic,
            isUnderline && styles.underline,
            isStrikethrough && styles.strikethrough,
            isCode && styles.code,
          ]}
        >
          {node.text}
        </Text>
      );
    }

    case 'link': {
      const handlePress = async () => {
        if (node.url) {
          await WebBrowser.openBrowserAsync(node.url);
        }
      };
      return (
        <Text style={styles.link} onPress={handlePress}>
          {renderChildren()}
        </Text>
      );
    }

    case 'quote':
      return (
        <View style={styles.quote}>
          <Text style={styles.quoteText}>{renderChildren()}</Text>
        </View>
      );

    case 'horizontalrule':
      return <View style={styles.hr} />;

    default:
      console.warn(`Unhandled Lexical node type: ${node.type}`);
      return null;
  }
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 12,
  },
  heading: {
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  h1: { fontSize: 28, lineHeight: 34 },
  h2: { fontSize: 24, lineHeight: 30 },
  h3: { fontSize: 20, lineHeight: 26 },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  strikethrough: { textDecorationLine: 'line-through' },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  list: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b',
    width: 20,
  },
  listItemContent: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
    paddingLeft: 16,
    marginVertical: 12,
    fontStyle: 'italic',
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  hr: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
});
