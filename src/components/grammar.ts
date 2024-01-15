export const grammar = [{"emits":"","left":"P","right":"Items $"},{"left":"Type","right":"( )","emits":""},{"left":"Type","right":"usize","emits":""},{"left":"Type","right":"isize","emits":""},{"left":"Type","right":"bool","emits":""},{"left":"Type","right":"string","emits":""},{"left":"Type","right":"Record","emits":""},{"left":"Record","right":"{ RecordFields }","emits":""},{"left":"RecordFields","right":"RecordFieldItem , RecordFields","emits":""},{"left":"RecordFields","right":"","emits":""},{"left":"RecordFieldItem","right":"id : Type","emits":""},{"left":"Items","right":"Item Items","emits":""},{"left":"Items","right":"","emits":""},{"left":"Item","right":"Fn","emits":""},{"left":"Item","right":"Let","emits":""},{"left":"Let","right":"let id = E ;","emits":""},{"left":"Fn","right":"fn id ( FnArgsOpt ) -> Type { E }","emits":"fn_expr($4, $7, $9)"},{"left":"FnArgsOpt","right":"","emits":""},{"left":"FnArgsOpt","right":"FnArgs","emits":""},{"left":"FnArgs","right":"FnArgs , FnArg","emits":""},{"left":"FnArgs","right":"FnArg","emits":""},{"left":"FnArg","right":"id : Type","emits":""},{"emits":"op_or($1, $3)","left":"E","right":"E || O"},{"emits":"","left":"E","right":"O"},{"emits":"op_and($1, $3)","left":"O","right":"O && A"},{"emits":"","left":"O","right":"A"},{"emits":"op_lt($1, $3)","left":"A","right":"A < B"},{"emits":"op_gt($1, $3)","left":"A","right":"A > B"},{"emits":"op_ge($1, $3)","left":"A","right":"A >= B"},{"emits":"op_le($1, $3)","left":"A","right":"A <= B"},{"emits":"","left":"A","right":"B"},{"emits":"op_add($1, $3)","left":"B","right":"B + T"},{"emits":"op_sub($1, $3)","left":"B","right":"B - T"},{"emits":"","left":"B","right":"T"},{"emits":"op_mul($1, $3)","left":"T","right":"T * F"},{"emits":"op_div($1, $3)","left":"T","right":"T / F"},{"emits":"","left":"T","right":"F"},{"emits":"","left":"F","right":"N"},{"emits":"op_sub(integer(0), $2)","left":"F","right":"- N"},{"emits":"op_not($2)","left":"F","right":"! N"},{"emits":"","left":"N","right":"id I"},{"emits":"","left":"N","right":"num"},{"emits":"$2","left":"N","right":"( E )"},{"emits":"if_expr($2, $4, $8)","left":"N","right":"if E { E } else { E }"},{"emits":"","left":"I","right":""},{"emits":"$2","left":"I","right":"( L )"},{"emits":"","left":"L","right":""},{"emits":"","left":"L","right":"M"},{"emits":"","left":"M","right":"M , E"},{"emits":"","left":"M","right":"E"}]

export const replacements = [{"find":"->","replace":"Token::Arrow"},{"find":"usize","replace":"Token::USize"},{"find":"isize","replace":"Token::ISize"},{"find":"bool","replace":"Token::Bool"},{"find":"string","replace":"Token::String"},{"find":":","replace":"Token::Colon"},{"find":"let","replace":"Token::Let"},{"find":";","replace":"Token::Semi"},{"find":"=","replace":"Token::Assign"},{"find":"fn","replace":"Token::Fn"},{"find":"!","replace":"Token::Not"},{"find":"&&","replace":"Token::And"},{"find":"||","replace":"Token::Or"},{"find":"id","replace":"Token::Id(_)"},{"find":"num","replace":"Token::Num(_)"},{"find":"if","replace":"Token::If"},{"find":"else","replace":"Token::Else"},{"find":"(","replace":"Token::LParen"},{"find":")","replace":"Token::RParen"},{"find":"<","replace":"Token::LessThan"},{"find":">","replace":"Token::GreaterThan"},{"find":"<=","replace":"Token::LessEqual"},{"find":">=","replace":"Token::GreaterEqual"},{"find":"+","replace":"Token::Plus"},{"find":"-","replace":"Token::Minus"},{"find":"*","replace":"Token::Mul"},{"find":"/","replace":"Token::Div"},{"find":"$","replace":"Token::Eof"},{"find":"{","replace":"Token::LBrace"},{"find":"}","replace":"Token::RBrace"},{"find":",","replace":"Token::Comma"}]
