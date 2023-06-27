const { contextBridge, ipcRenderer, shell} = require("electron");
let darkmodeVal = localStorage.getItem("darkmode");
const fs = require("fs");
const path = require("path");
const {spawn, exec}  = require('child_process');
// if (require('os').platform() == "win32") var pythonExecutable ="../noduro_python/Scripts/python.exe";
// else var pythonExecutable = "../noduro_python/bin/python";

async function sign_in(email,password,user_signing_in){
    console.log("sign in request sent to preload");
    const user = await ipcRenderer.invoke("firebase:email_sign_in", email, password,user_signing_in);
    if (user[0]) {
        console.log("user signed in");
        localStorage.setItem("email", email);
        user[1] = JSON.parse(user[1]);
    } else {
        console.log("user sign in failed");
    }
    return user;
}

contextBridge.exposeInMainWorld("darkMode", {
    toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
    system: () => ipcRenderer.invoke("dark-mode:system"),
    dark: () => ipcRenderer.invoke("dark-mode:dark"),
    light: () => ipcRenderer.invoke("dark-mode:light"),
});

contextBridge.exposeInMainWorld("firebase", {
    delete_local_accounts: () => {
        try {
            ipcRenderer.invoke("firebase:delete_local")
            return true;
        }
        catch{
            console.log("Error deleting local accounts");
            return false;
        }
    },
    get_last_login: async (duration) => {
        const email = localStorage.getItem("email");
        if (email == null) {
            return true;
        }
        else{
            var login_string = await ipcRenderer.invoke("firebase:get_last_login", email)
            var last_login = parseInt(login_string);
            // console.log((Date.now() - last_login)/1000);
            if (Date.now() - last_login > duration*1000) {
                const signing_out = await ipcRenderer.invoke("firebase:email_sign_out", email);
                return true;
            }
            else{
                return false;
            }
        }
    },
    check_user_local: async () => {
        const email = localStorage.getItem("email");
        console.log("check user request sent to preload");
        const user =  await ipcRenderer.invoke("firebase:check_user_persist", email);
        const signed_in = await sign_in(email, user[1], false)
        if (signed_in[0] == true) {
            const user_info = await ipcRenderer.invoke("firebase:get_current_user_information", signed_in[1]);
            localStorage.setItem("first_name", user_info[1].first_name);
            return user_info;
        }
        else {
            return signed_in;
        }
    },
    email_sign_up: async (email, password, first_name, last_name, date_of_birth) => {
        console.log("sign up request sent to preload");
        const user = await ipcRenderer.invoke("firebase:email_sign_up", email, password, first_name, last_name, date_of_birth);
        console.log("sign up request in progress");
        
        if (user[0]) {
            localStorage.setItem("email", email);
            console.log("user signed up");
            user[1] = JSON.parse(user[1]);
        } else {
            console.log("user sign up failed");
        }
        return user;
    },
    email_sign_in: async (email, password) => {
        return await sign_in(email, password,true);
    },
    google_sign_in: async () => {
        const user = await ipcRenderer.invoke("firebase:google_sign_in");
        if (user[0]) {
            localStorage.setItem("email", email);
            console.log("user signed up");
            user[1] = JSON.parse(user[1]);
        } else {
            console.log("user sign up failed");
        }
        return user;
    },
    get_current_user: async( ) => {
        console.log("get user request sent to preload");
        const user = await ipcRenderer.invoke("firebase:get_current_user");
        if (user[0]) {
            console.log("user found");
            user[1] = JSON.parse(user[1]);
        } else {
            console.log("user not found");
        }
        return user;

    },
    get_current_user_information: () => {
        console.log("get user information sent to preload");
        ipcRenderer.invoke("firebase:get_current_user_information");
        console.log("get user information in progress");
        ipcRenderer.on("user_information", (event, user) => {
            if (user[0]) {
                console.log("user information found");
                return user[1];
            } else {
                console.log("user information not found");
                return user[1];
            }
        });
    },
    email_sign_out: () => {
        console.log("sign out request sent to preload");
        ipcRenderer.invoke("firebase:email_sign_out");
        console.log("sign out request in progress");
        ipcRenderer.on("sign_out", (event, user) => {
            if (user[0]) {
                console.log("user signed out");
                return user[1];
            } else {
                console.log("user sign out failed");
                return user[1];
            }
        });
    }

});

contextBridge.exposeInMainWorld("noduro", {
    openExternal: (url) => {
        shell.openExternal(url);
        console.log("open external request sent to preload");
    },
    readJSONFile: (filePath, absolute) => {
        if (absolute == undefined) absolute = false;
        try {
            if (absolute) var data = fs.readFileSync(filePath, 'utf-8');
            else var data = fs.readFileSync(path.join(__dirname.split(path.sep).slice(0, -1).join(path.sep), filePath), 'utf-8');
                const jsonObject = JSON.parse(data);
            return jsonObject;
        } catch (error) {
            throw new Error('File does not exist');
        }
    },
    writeJSONFile: (filePath, content,absolute) => {
        if (absolute == undefined) absolute = false;
        try {
            if (absolute) fs.writeFileSync(filePath, content);
            else fs.writeFileSync(path.join(__dirname.split(path.sep).slice(0, -1).join(path.sep), filePath), content);
            console.log('Object saved as JSON:', filePath);
        } catch (error) {
            console.error('Error saving object as JSON:', error);
        }
    },
    // startPythonFile: (filePath, settings) => {

    //     const pythonProcess = spawn(pythonExecutable, [filePath]);

    //     pythonProcess.stdout.on('data', (data) => {
    //         // Handle output from the Python script if needed
    //         data = data.toString().trim();
    //         data = data.split(" ");
    //         // Split the data string based on spaces and get the first part
    //         // Decode the base64 image data
    //         window.postMessage({type: 'imageData', payload: data}, '*');
    //     });
        
    //     pythonProcess.stderr.on('data', (data) => {
    //     // Handle errors from the Python script if needed
    //     console.error(`stderr: ${data}`);
    //     });
    // },
    startExeFile: (filePath, settings) => {

        const pythonProcess = spawn(filePath);

        pythonProcess.stdout.on('data', (data) => {
            // Handle output from the Python script if needed
            data = data.toString().trim();
            data = data.split(" ");
            // Split the data string based on spaces and get the first part
            // Decode the base64 image data
            window.postMessage({type: 'imageData', payload: data}, '*');
        });
        
        pythonProcess.stderr.on('data', (data) => {
        // Handle errors from the Python script if needed
        console.error(`stderr: ${data}`);
        });
    },
    sendVideoFrame: (frameData) => {
        ipcRenderer.send('videoFrame', frameData);
    },
    get_lesson_path: (folder_path) => {
        
        var read = fs.readFileSync(path.join(folder_path, "data.json"), 'utf-8');
        var data = JSON.parse(read);
        for (var metaPath in data.meta){
            data.meta[metaPath] = path.join(folder_path, data.meta[metaPath])
        }
        return data;
    },
    get_lesson_data: (lesson_id) => {
        try {
            var full_path = path.join(__dirname, "lessons", lesson_id, "data.json");
            var read = fs.readFileSync(full_path, 'utf-8');
            var data = JSON.parse(read);
            for (var metaPath in data.meta){
                data.meta[metaPath] = path.join(__dirname, "lessons", lesson_id, data.meta[metaPath])
            }
            return data;
        } catch (error) {
            throw new Error('File does not exist');
            return null;
        }
    },
    folder_picker: async () => {
        const file = await ipcRenderer.invoke('noduro:folder_picker');
        return file;
    }
});



// Code that forces the system mode rather than a default of white. Reflects user preference, but open to change.
if (localStorage.getItem("lesson_folder") == null) {
var all_folders = fs.readdirSync(localStorage.getItem("lessons_folder"));
var lessons = [];
var folders_filtered = [];
// console.log(files);
for (let i = 0; i < all_folders.length; i++) {
    try {
        var p = fs.readdirSync(path.join(localStorage.getItem("lessons_folder"), all_folders[i]));
    }
    catch (error) {
        continue;
    }
    let image = null;
    for (const file of p) {
        const ext = path.extname(file).toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif") {
            image = file;
            break; // stop searching after the first image is found
        }
    }
    if (image == null) {
        continue;
    }

    // console.log(path.join("./lessons/", i, p[0]));
    lessons.push(path.join(localStorage.getItem("lessons_folder"), all_folders[i], image));
    folders_filtered.push(all_folders[i]);

    // for (var ap in p) {
    //     // if (ap.includes(".png") || ap.includes(".jpg")) {
    //     lessons.push(path.join("./lessons/", i, ap));
    //     // }
    //     console.log(ap);
    // }
}
localStorage.setItem("files", JSON.stringify(folders_filtered));
localStorage.setItem("lessons", JSON.stringify(lessons));
}