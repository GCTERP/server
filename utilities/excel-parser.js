import XLSX from "xlsx"

export const excelToJson = (filename) => {

    const excel = XLSX.readFile(filename)

    const source = excel.Sheets[excel.SheetNames[0]]

    const data = XLSX.utils.sheet_to_json(source)
    
    const result = data.map(doc => expandObject(doc))

    return result
}

export const jsonToExcel = (data) => {

    const json = data.map(doc => shrinkObject(doc))

    const workSheet = XLSX.utils.json_to_sheet(json);
    
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, "data");
    
    XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })
    
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" })

    XLSX.writeFile(workBook, "data.xlsx")
}

function expandObject(doc) {

    let result = { }

    for(let key of Object.keys(doc)) {

        let object = result

        let list = key.split('_')

        let len = list.length
        
        for(let idx = 0; idx < len - 1; idx++) {

            let val = list[idx]

            if(!object[val]) object[val] = {}

            object = object[val]
        }

        object[list[len - 1]] = doc[key]
        
    }   return result
}

function shrinkObject(doc, str = "", result = {}) {

    for(let key of Object.keys(doc)) {

        let newKey = str != "" ? str + "_" + key : key

        if(typeof(doc[key]) == typeof({})) {

            shrinkObject(doc[key], newKey, result)

        } else result[newKey] = doc[key]

    }   return result
}