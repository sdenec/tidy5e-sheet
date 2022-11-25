function _skill_no( name ){ 
    if( name=="str" ) {
        return "1";
    }
    else if( name=="dex" ) {
        return "2";
    }
    else if( name=="con" ) {
        return "3";
    }
    else if( name=="int" ) {
        return "4";
    }
    else if( name=="wis" ) {
        return "5";
    }
    else if( name=="cha" ) {
        return "6";
    }
};

function _compare_skills(a,b){ 
    // example result: 2Acrobatics, 5Perception
    const t1 =  ( _skill_no(a[1].ability) + a[1].label ); 
    const t2 =  ( _skill_no(b[1].ability) + b[1].label );
    return t1 > t2 ? 1 : -1 ;
};

function sortList(ul){
    let new_ul = ul.cloneNode(false);

    // Add all lis to an array
    let lis = [];
    for(let i = ul.childNodes.length; i--;){
        if(ul.childNodes[i].nodeName === 'LI') {
            lis.push(ul.childNodes[i]);
        }
    }

    // Sort the lis in descending order
    // lis.sort(function(a, b){
    //    return parseInt(b.childNodes[0].data , 10) - 
    //           parseInt(a.childNodes[0].data , 10);
    // });
    lis.sort( _compare_skills );

    // Add them into the ul in order
    for(let i = 0; i < lis.length; i++) {
        new_ul.appendChild(lis[i]);
    }
    ul.parentNode.replaceChild(new_ul, ul);
}

// export function orderSkillsByScore(app, html, data){
// 	// let ul = html.find("ul.skills-list");
// 	// let li = ul.children("li");
// 	// li.detach().sort( _compare_skills );
// 	// ul.append(li);
//     if(html.length > 0 && html[0].getElementsByClassName('skills-list').length > 0) {
//         for(const elem of html[0].getElementsByClassName('skills-list')) {
//             sortList(elem);
//         }
//     }
// };

export function orderSkillsByScore(skills){
    let new_Skills = deepClone(skills);
    new_Skills = Object.entries(new_Skills).sort( _compare_skills );
    let new_Skills2 = {};
    for(const skillObj of new_Skills) {
        new_Skills2[skillObj[0]] = skillObj[1];
    }
    return new_Skills2;
};