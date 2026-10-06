// Wraps every markdown <table> in <div class="zz-table">, so a wide table
// scrolls inside its own box on a phone instead of widening the page.
// Typography styles the <table> itself; only the wrapper scrolls.
export default function rehypeTableScroll() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['zz-table'] },
            children: [child],
          }
        }
        visit(child)
        return child
      })
    }
    visit(tree)
  }
}
