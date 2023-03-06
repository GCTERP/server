import XLSX from "xlsx"
import fs from "fs"


export const excelToJson = async () => {

    let time = Date.now().toString()

    await file.mv("./trash/upload_" + time + ".xlsx")

    const excel = XLSX.readFile("C:/Users/THIYANESH S/Downloads/IT_Enrollment.xlsx")

    const source = excel.Sheets[excel.SheetNames[0]]

    const data = XLSX.utils.sheet_to_json(source)

    let result = data.map(doc => expandObject(doc))

    fs.unlinkSync("./trash/upload_" + time + ".xlsx")

    return result.map(doc => rectifyObject(doc))
}

export const jsonToExcel = (data) => {

    const json = data.map(doc => shrinkObject(doc))

    const workSheet = XLSX.utils.json_to_sheet(json);
    
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, "data");
    
    XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })
    
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" })

    let time = Date.now().toString()

    XLSX.writeFile(workBook, "./trash/download_" + time + ".xlsx")

    let blob = fs.readFileSync("./trash/download_" + time + ".xlsx")

    fs.unlinkSync("./trash/download_" + time + ".xlsx")
    
    return blob

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

function rectifyObject(obj) {

    for(let key of Object.keys(obj)) {

        if(typeof(obj[key]) == typeof({})) {
        
            if(obj[key][0]) {
        
                let result = []

                for(let idx of Object.keys(obj[key]))

                    result.push(obj[key][idx])

                obj[key] = result
        
            } else rectifyObject(obj[key])
        }
    }   return obj
}