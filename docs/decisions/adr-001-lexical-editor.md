# ADR-001: Adoption of Lexical Editor Framework

## Status
Accepted

## Context
Atlas v2 requires a robust, extensible rich text editor for its notes functionality. The initial implementation used TipTap, but we needed to evaluate if this was the optimal choice for our long-term needs.

### Requirements
- Extensibility for custom nodes and plugins
- React 19 compatibility
- Performance with large documents
- Accessibility compliance
- Framework-agnostic core with React bindings
- Strong TypeScript support
- Active maintenance and community

### Options Considered
1. **TipTap** - ProseMirror-based editor with Vue/React support
2. **Lexical** - Meta's (Facebook) extensible text editor framework
3. **Slate** - Customizable framework for rich text editors
4. **Draft.js** - Facebook's older rich text framework (deprecated)

## Decision
We chose to migrate from TipTap to Lexical for the following reasons:

### Technical Advantages
- **Modern Architecture**: Built from scratch with lessons learned from Draft.js
- **Performance**: Better performance with large documents through efficient reconciliation
- **Node System**: Powerful node-based architecture with five extensible base types
- **Transform System**: Efficient node transforms for real-time text processing
- **Plugin Architecture**: Clean separation of concerns with React-specific plugins

### Implementation Benefits
- **React 19 Ready**: Full compatibility with React Server Components and concurrent features
- **Type Safety**: Comprehensive TypeScript definitions with strict typing
- **Accessibility**: WCAG 2.1 compliant with built-in screen reader support
- **Extensibility**: Easy to create custom nodes (ElementNode, TextNode, DecoratorNode)

### Community and Support
- **Active Development**: Regular updates from Meta's team
- **Growing Ecosystem**: Increasing number of plugins and extensions
- **Documentation**: Comprehensive docs with interactive examples
- **Migration Path**: Clear patterns for extending and customizing

## Consequences

### Positive
- Better long-term maintainability with Meta's backing
- Improved performance for complex documents
- Easier to implement custom features through node transforms
- Better integration with React 19 features
- More flexible plugin system for future extensions

### Negative
- Migration effort required from TipTap
- Learning curve for team familiar with ProseMirror concepts
- Smaller ecosystem compared to ProseMirror-based editors
- Some features need custom implementation

### Migration Strategy
1. Implement Lexical in parallel with existing TipTap
2. Create compatibility layer for existing content
3. Migrate features incrementally:
   - Basic text formatting
   - Custom nodes (embeds, mentions)
   - Collaborative features
4. Maintain backward compatibility during transition

## Technical Implementation

### Node Architecture
```typescript
// Custom nodes extend base types
class CustomParagraphNode extends ElementNode
class EmojiNode extends TextNode
class VideoNode extends DecoratorNode
```

### Plugin System
```typescript
// Plugins as React components
<LexicalComposer initialConfig={config}>
  <RichTextPlugin />
  <HistoryPlugin />
  <AutoFocusPlugin />
  <CustomEmojiPlugin />
</LexicalComposer>
```

### Transform System
```typescript
// Automatic text transformations
editor.registerNodeTransform(TextNode, (node) => {
  // Transform :) to emoji node
})
```

## References
- [Lexical Documentation](https://lexical.dev)
- [Meta Engineering Blog: Lexical](https://engineering.fb.com/2022/04/12/open-source/lexical/)
- [Migration Guide from Draft.js](https://lexical.dev/docs/migration/draft-js)
- Internal POC: `/src/components/editor/`

## Review
- **Proposed**: 2024-12-01
- **Reviewed**: 2024-12-05
- **Accepted**: 2024-12-10
- **Implemented**: 2024-12-15