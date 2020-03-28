module.exports = function (babel) {
  const { types: t } = babel;
  return {
    visitor: {
      CallExpression (path) {
        let callee = path.get('callee');
        if(t.isMemberExpression(callee)
          && t.isIdentifier(callee.node.object)
          && t.isIdentifier(callee.node.property)
          && callee.node.object.name === 'React' 
          && callee.node.property.name === 'createElement'){
          let args = path.get('arguments');
          if(t.isObjectExpression(args[1])){
            let props = args[1].get('properties');
            let rModel = props.find(item=>{
              return t.isIdentifier(item.node.key)&&item.node.key.name === "rModel";
            })
            if(rModel){
              //如果的props中同时存在rModel与value，删除value
              props.forEach(item => {
                if(t.isIdentifier(item.node.key)&&item.node.key.name === "value"){
                  item.remove();
                }
              });
              rModel.node.key.name = 'value';

              //获得rModel的绑定属性名rModelValue
              let rModelValue = null;
              let rModelHandle = null;
              let changeStateCode = [];
              if(rModel.node.value){
                // rModel=[inputVal, changeInputVal]
                if(t.isArrayExpression(rModel.node.value)) {
                  if(rModel.node.value.elements && rModel.node.value.elements.length === 2) {
                    rModelValue = rModel.node.value.elements[0].name;
                    rModelHandle = rModel.node.value.elements[1].name;
                    console.log('babelPengin:', rModelValue, rModelHandle);
                    rModel.node.value = t.identifier(rModelValue);
                    //  生成改变state的代码
                    //   changeInputVal(e.target.value)
                    changeStateCode = [
                      t.expressionStatement(
                        t.callExpression(
                          t.identifier(rModelHandle), 
                          [t.memberExpression(t.memberExpression(t.identifier('e'), t.identifier('target')),t.identifier('value'))]
                        )
                      )
                    ]
                  }
                } else if(rModel.node.value.property) {
                  rModelValue = rModel.node.value.property.name;
                  //  生成改变state的代码
                  //   let val = e.target.value;
                  //   this.setState((state)=>({rModelValue:val}))
                  changeStateCode = [
                    //let val = e.target.value;
                    t.variableDeclaration('let', [t.variableDeclarator(
                      t.identifier('temp'),
                      t.memberExpression(t.memberExpression(t.identifier('e'), t.identifier('target')),t.identifier('value'))
                    )]),
                    //this.setState((state=>({rModelValue:val})))
                    t.expressionStatement(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('this'), t.identifier('setState')
                        ), 
                        [t.arrowFunctionExpression(
                          [t.identifier('state')],
                          t.ObjectExpression(
                            [t.objectProperty(
                              t.identifier(rModelValue),
                              t.identifier('temp')
                            )]
                          )
                        )]
                      )
                    )
                  ];
                }
              }
              if(!rModelValue){
                console.error('rModel property error!')
                return false;
              }

              //找出onChange的prop
              let onChangeProperty = props.find(item=>{
                return item.node&&t.isIdentifier(item.node.key)&&item.node.key.name === "onChange";
              })

              //已经存在onChange，合并，
              //把原onChange的处理函数放在生成的onChange里调用，
              //然后再后面添加修改state的代码
              if(onChangeProperty){ 
                let changeHandlePath = onChangeProperty.get('value');
                const id = changeHandlePath.scope.generateUidIdentifierBasedOnNode(changeHandlePath.node.id);
                changeHandlePath.replaceWith(
                  t.arrowFunctionExpression(
                    [t.identifier('e')],
                    t.blockStatement([
                      t.variableDeclaration('let', [t.variableDeclarator(
                        id,
                        changeHandlePath.node
                      )]),
                      t.expressionStatement(t.callExpression(id,[t.identifier('e')])),
                      ...changeStateCode
                    ])
                  )
                );
              } else { 
                // 不存在onChange，生成一个
                // onChange: (e)=>{
                // }
                rModel.insertAfter(
                  t.objectProperty(
                    t.identifier('onChange'),
                    t.arrowFunctionExpression(
                      [t.identifier('e')], 
                      t.blockStatement(
                        changeStateCode
                      )
                    )
                  )
                );
              }
            }
          }
        }
      }
    }
  }
}
