import fs from 'fs'
import { parse } from 'acorn'

/**
 *
 * @param {string} path
 */
export function findModules(path) {
  const contents = fs.readFileSync(path, 'utf8')
  const parsedCode = parse(contents, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })
  const ids = []

  // @ts-ignore
  for (const node of parsedCode.body) {
    if (node.type === 'ImportDeclaration' && node.source.type === 'Literal') {
      ids.push(node.source.value)
    }

    if (
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee.type === 'Identifier' &&
      (node.expression.callee.name === 'describe' ||
        node.expression.callee.name === 'it')
    ) {
      ids.push('mocha')
    }

    if (
      node.type === 'VariableDeclaration' &&
      node.declarations[0].init.callee.name === 'require' &&
      node.declarations[0].init.arguments[0].type === 'Literal'
    ) {
      ids.push(node.declarations[0].init.arguments[0].value)
    }
  }

  return ids
}
