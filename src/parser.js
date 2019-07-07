
export function Parser(opt) {
    var self = this;
    this.opt = null;
    var result = null;

    function getTestType(str) {
        var answerStr = getAnswerStr(undefined, str);
        var questionStr = getQuestionStr(4, str);

        var index = 'ABCDEFGH'.indexOf(answerStr);

        if (index !== -1 && answerStr.length === 1) {
            return 1;
        } else if (index !== -1 && answerStr.length >= 2) {
            return 2;
        }

        if (answerStr === '对' || answerStr === '错' || answerStr === '正确' || answerStr === '错误') {
            return 3;
        }

        var flag = (/\(\)|（）/ig).test(questionStr);
        if (flag) {
            return 4;
        }

        return 5;
    }

    function getQuestionStr(type, str) {
        if (type === 1 || type === 2) {
            var questionStr = str.substring(0, str.search(/A[\.、]/i));
            return questionStr.trim();
        } else if (type === 3 || type === 4 || type === 5) {
            var questionStr = str.substring(0, str.search(/答案[：:]/ig));
            return questionStr.trim();
        }
    }

    function getOptionStr(type, str) {
        if (type === 1) {
            var optionStr = str.substring(str.search(/A[\.、]/), str.search(/答案[:：]/));
            return optionStr.trim();
        }
    }

    function getAnswerStr(type, str) {
        var answerStr = str.match(/答案[:：][\s\S]*解析[:：]|答案[:：][\s\S]*难度[:：]/ig)[0];
        answerStr = answerStr.replace(/答案[：:]|解析[:：]|难度[:：]/ig, '');
        return answerStr.trim();
    }

    function getAnalysisStr(type, str) {
        var analyses = str.split(/解析[:：]|难度[:：]/g);
        var analyseStr = analyses[1];
        analyseStr = analyseStr.trim();
        return analyseStr;
    }

    function getDifficultStr(type, str) {
        var hardStr = str.match(/难度[：:].*\s/ig)[0];
        hardStr = hardStr.replace(/难度[：:]/ig, '').trim();
        return hardStr;
    }

    function getQuestion(type, str) {
        var questionStr = getQuestionStr(type, str);
        return questionStr;
    }

    function getOption(type, str) {
        if (type === 1) {
            var optionStr = getOptionStr(type, str);
            var options = optionStr.split(/[A-H][\.、]/g);
            var options = options.slice(1);
            var texts = options.map(function (item) {
                return item.substr(2, item.length).trim();
            });
            return texts;
        }
    }

    function getAnswer(type, str) {
        if (type === 1 || type === 3 || type === 4 || type === 5) {
            var answerStr = getAnswerStr(type, str);
            return answerStr;
        }
    }

    function getAnalysis(type, str) {
        var analysisStr = getAnalysisStr(type, str);
        return analysisStr;
    }

    function getDifficult(type, str) {
        var difficultStr = getDifficultStr(type, str);
        return difficultStr;
    };


    function toTestObj(type, str) {
        var obj = {};

        if (type === 1 || type === 2) {
            obj.type = type;
            obj.question = getQuestion(1, str);

            var texts = getOption(1, str);
            for (var i = 0; i < texts.length; i++) {
                obj['answer' + (i + 1)] = texts[i];
            }

            obj.key = getAnswer(1, str);
            obj.analysis = getAnalysis(1, str);
            obj.difficult = getDifficult(1, str);
        } else if (type === 3) {
            obj.type = type;
            obj.question = getQuestion(3, str);
            obj.key = getAnswer(3, str);
            obj.analysis = getAnalysis(3, str);
            obj.difficult = getDifficult(3, str);
        } else if (type === 4) {
            obj.type = type;
            obj.question = getQuestion(4, str);
            obj.key = getAnswer(4, str);
            obj.analysis = getAnalysis(4, str);
            obj.difficult = getDifficult(4, str);
        } else if (type === 5) {
            obj.type = type;
            obj.question = getQuestion(5, str);
            obj.key = getAnswer(5, str);
            obj.analysis = getAnalysis(5, str);
            obj.difficult = getDifficult(5, str);
        }
        return obj;
    }

    var test = {
        profile: function (str) {
            // 必须包含 答案 难度
            var flag = (/答案[：:]|难度[：:]/ig).test(str);
            if (!flag) {
                return false;
            }
            return true;
        },
        choice: function (str) {
            // 验证问题
            var q = getQuestionStr(1, str);
            if (q.length < 2) {
                return false;
            }

            // 验证选项
            // 必须有两个以上选项
            var optionStr = getOptionStr(1, str);
            var options = optionStr.match(/[A-H][\.、]/ig);
            var flag = (/A[\.、]|B[\.、]/ig).test(optionStr);
            if (!flag) {
                return false;
            }

            // 必须选项升序+1
            var tmp = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

            var flagAsc = options.every(function (item, index) {
                return item.substr(0, 1) === tmp[index];
            });

            if (!flagAsc) {
                return false;
            }

            // 验证答案
            var answerStr = getAnswerStr(1, str);
            var answers = answerStr.match(/[A-H]/ig);
            var opts = options.map(function (item) {
                return item.substr(0, 1);
            });
            var answerFlag = answers.every(function (item) {
                return opts.indexOf(item) !== -1;
            });

            if (!answerFlag) {
                return false;
            }

            // 验证难度
            var difficultStr = getDifficultStr(undefined, str);
            var hardIndex = ['简单', '普通', '困难'].indexOf(difficultStr);
            if (hardIndex === -1) {
                return false;
            }

            return true;
        },

        judge: function (str) {
            // 验证问题
            var questionStr = getQuestionStr(3, str);
            if (questionStr.length < 2) {
                return false;
            }

            // 验证答案
            var answerStr = getAnswerStr(3, str);

            if (!(answerStr === '对' || answerStr === '错' || answerStr === '正确' || answerStr === '错误')) {
                return false;
            }

            // 验证难度
            var difficultStr = getDifficultStr(undefined, str);
            var hardIndex = ['简单', '普通', '困难'].indexOf(difficultStr);
            if (hardIndex === -1) {
                return false;
            }

            return true;
        },

        gap: function (str) {
            // 验证问题
            var questionStr = getQuestionStr(4, str);

            if (questionStr.length < 2) {
                return false;
            }

            var gaps = questionStr.match(/\(\)|（）/ig);

            if (gaps.length === 0) {
                return false;
            }


            // 验证答案
            var answerStr = getAnswerStr(4, str);
            var answers = answerStr.split('|');
            if (gaps.length !== answers.length) {
                return false;
            }

            // 验证难度
            var difficultStr = getDifficultStr(undefined, str);
            var hardIndex = ['简单', '普通', '困难'].indexOf(difficultStr);
            if (hardIndex === -1) {
                return false;
            }

            return true;
        },

        solution: function (str) {
            // 验证问题
            var questionStr = getQuestionStr(4, str);

            if (questionStr.length < 3) {
                return false;
            }

            // 验证答案
            var answerStr = getAnswerStr(4, str);
            if (answerStr.length < 2) {
                return false;
            }

            // 验证难度
            var difficultStr = getDifficultStr(undefined, str);
            var hardIndex = ['简单', '普通', '困难'].indexOf(difficultStr);
            if (hardIndex === -1) {
                return false;
            }

            return true;
        }
    };

    /*
    首先对题目进行必备信息的验证

    开始将str分号切割后遍历该试题字符串数组
    每个字符串试题，从头到尾开始遍历查询，得到对应的内容a
    对a采用对应的规则，如果不匹配则将该试题和错误的规则记录下来，
    若一个试题验证通过，则将该试题也保存下来
    最好处理出错和成功的结果。

    */
    function convert(str) {

        var error = [];
        var success = [];

        var tNoExp = /\d[\.、]/g;
        var qs = str.split(tNoExp).slice(1);

        for (var i = 0; i < qs.length; i++) {
            if (!test.profile(qs[i])) {
                break;
            }

            var r = null;

            var type = getTestType(qs[i]);
            if (type === 1 && test.choice(qs[i])) {
                r = toTestObj(type, qs[i]);
            } else if (type === 2 && test.choice(qs[i])) {
                r = toTestObj(type, qs[i]);
            } else if (type === 3 && test.judge(qs[i])) {
                r = toTestObj(3, qs[i]);
            } else if (type === 4 && test.gap(qs[i])) {
                r = toTestObj(type, qs[i]);
            } else if (type === 5 && test.solution(qs[i])) {
                r = toTestObj(type, qs[i]);
            }
            success.push(r);
        }

        return {
            success,
            error
        };
    }

    ;(function init() {
        self.opt = opt;
        result = convert(self.opt.text);
    })();

    Parser.prototype.getResult = function () {
        return result;
    };
}