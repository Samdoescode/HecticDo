import { createSignal, Match, For, Switch, createEffect,  onCleanup } from 'solid-js';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { createStore } from "solid-js/store"
import MarkDownEditor from './markdwonEditor';

export default function Home() {



    type task = { id: number, name: string, completed: boolean }
    type taskWrapper = { tasks: task[] }
    type timerWrapper = { clockSequence: number[] }
    type uiStateWrapper = { notes: boolean, timer: boolean }
    const [tasks, setTasks] = createStore<taskWrapper>({
        tasks: []
    })
    const [countdown, setCountdown] = createStore<timerWrapper>({ clockSequence: [] })
    const [uiState, setUIState] = createStore<uiStateWrapper>({ notes: true, timer: false })
    const [timerActive, setTimerActive] = createSignal(true)
    const RenderClock = (props: any) => {
        const [minutes, setminutes] = createSignal<number>(0)
        const [seconds, setSeconds] = createSignal<number>(0)
        const calMinSec = (time: number): [minutes: number, seconds: number] => {
            const mins = Math.floor(time / 60)
            const secs = time % 60
            return [mins, secs]
        }
        createEffect(() => {
            const [getmins, getsecs] = calMinSec(props.props.timeLeft[0])
            setSeconds(getsecs)
            setminutes(getmins)
        })

        return (
            <>
                <div class="flex m-4 flex-row">
                    <div class="flex m-2 py-4 px-10 gap-4 flex-row dark:bg-gray-800 bg-gray-200 rounded-full ">
                        <div class="text-5xl  dark:text-gray-100 text-gray-900">{minutes()}</div>
                        <div class="text-5xl dark:text-gray-100 text-gray-900">:</div>
                        <div class="text-5xl dark:text-gray-100 text-gray-900">{seconds() < 10 ? "0" + seconds() : seconds()}</div>
                        <button onclick={() => setTimerActive(!timerActive())} class="inset-y-0 left-0 flex items-center pl-3">
                            <Switch>
                                <Match when={timerActive()}>
                                    <span class="material-symbols-outlined dark:text-gray-300 text-gray-700 sm:text-sm">
                                        autopause
                                    </span>
                                </Match>
                                <Match when={!timerActive()}>
                                    <span class="material-symbols-outlined dark:text-gray-300 text-gray-700 sm:text-sm">
                                        autoplay
                                    </span>
                                </Match>
                            </Switch>
                        </button>
                    </div>
                    <div class="flex m-2 py-2 h-1/3 px-8 gap-2 flex-row dark:bg-gray-800  bg-gray-200 rounded-full">
                        <div class='text-2xl'>{calMinSec(props.props.timeLeft[1])[0]}</div>
                        <div class='text-2xl'>:</div>
                        <div class='text-2xl'>00</div>

                    </div>
                </div>
            </>
        )
    }
    function SetTimer() {
        createEffect(() => {
            let timer: NodeJS.Timer
            if (countdown.clockSequence.length > 0) {
                if (timerActive()) {
                    timer = setInterval(() => setCountdown("clockSequence", 0, i => i - 1), 1000)
                    if (countdown.clockSequence[0] == 0) {
                        setTimerActive(false)
                        setCountdown("clockSequence", countdown.clockSequence.slice(1))
                    }
                } else {
                    //timer is paused
                }

            } else if (countdown.clockSequence.length == 0 && timerActive()) {

            }
            onCleanup(() => {
                clearInterval(timer)
            })
        })

        return (
            <>
                <RenderClock props={{ timeLeft: countdown.clockSequence }} />
            </>
        )
    }
    const markComplete = (id: number) => {
        setTasks("tasks", task => task.id === id, "completed", completed => !completed)
    }
    const deleteTask = (id: number) => {
        setTasks("tasks", (tasks) => [...tasks.filter(i => i.id !== id)])
    }

    const [darkMode, setDarkMode] = createSignal(true)
    const taskColour = (complete: boolean) => {
        const filter = tasks.tasks.filter(i => !(i.completed)).length;
        let red: number
        let blue: number
        let green: number
        if (complete) {
            if (darkMode()) {
                red = 49
                green = 163
                blue = 91
            } else {
                red = 74
                green = 222
                blue = 128
            }
        } else {
            if (darkMode()) {
                red = 255 - (255 / Math.max(filter / 5, 1))+17
                green = 24
                blue = 39

            } else {
                red = 255 - 12
                green = 255 / Math.max(filter / 5, 1) - 11
                blue = 255 / Math.max(filter / 5, 1) - 9
            }
        }
        return ([red, green, blue])
    }
    let input: any

    const updateWindowSize = async (height: number | "current", width: number | "current", direction: "grow" | "shrink") => {
        // if (typeof height == "number" && typeof width == "number")
        const sizeOfWindow = await appWindow.innerSize()
        let calcdwidth: number
        if (typeof width == "number") {
            if (direction == "grow") { calcdwidth = sizeOfWindow.width + width } else { calcdwidth = width }
        } else {
            calcdwidth = sizeOfWindow.width
        }
        await appWindow.setSize(new LogicalSize(calcdwidth, sizeOfWindow.height))
    }
    createEffect(() => {
        if (darkMode()) {
            localStorage.theme = 'dark'
        } else {
            localStorage.theme = 'light'
        }
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    })

    return (
        <section class="bg-gray-100 text-gray-700 dark:text-gray-300 dark:bg-gray-900 flex h-screen gap-6 divide-gray-300 dark:divide-gray-700 divide-x-2 flex-row  p-8">
            <div class='gap-4 grow max-w-md'>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
                <div class="w-full p-4">
                    <div class="flex gap-4 items-center justify-between mb-4">
                        <h5 class="text-xl grow font-bold leading-none dark:text-gray-100 text-gray-900">Tasks</h5>
                        <button onclick={() => {
                            setUIState("timer", i => !i)
                            setCountdown("clockSequence", [10, 300, 1500, 300, 1500, 1500])
                        }}>
                            <span class="z-10 dark:text-gray-300  text-gray-700 material-symbols-outlined">
                                timelapse
                            </span>
                        </button>
                        <button onclick={() => {
                            setUIState("notes", !uiState.notes)
                            if (uiState.notes) {
                                updateWindowSize("current", 510, "grow")
                            } else if (!uiState.notes) {
                                updateWindowSize("current", 519, "shrink")
                            }

                        }
                        }>
                            <span class="z-10 dark:text-gray-300 text-gray-700  material-symbols-outlined">
                                sticky_note_2
                            </span>
                        </button>
                    </div>
                    <div class="">
                        <ul role="list" class="divide-y dark:divide-gray-700  divide-gray-300">
                            <For each={tasks.tasks} fallback={
                                <li class="p-2 rounded-sm flex flex-row items-center">
                                    <div class="flex">
                                        <div class="flex-row items-center  border-0  flex mt-2 w-full  rounded-md gap-4">
                                            <p class="block w-full pl-3 rounded-sm border-none py-1.5 dark:text-gray-100  text-gray-900">
                                                Lets get this day started...
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-center grow space-x-4">
                                        <div class="flex-shrink-0">
                                        </div>
                                        <div class="flex-1 min-w-0 grow">
                                        </div>
                                    </div>
                                </li>
                            }>
                                {(item) =>
                                    <li style={{ "background": `rgba(${taskColour(item.completed)},1)` }} class="p-2 rounded-sm flex flex-row  items-center">
                                        <div class="flex">
                                            <div class="flex-row items-center  border-0  flex mt-2 w-full  rounded-md gap-4">
                                                <button onclick={() => markComplete(item.id)} class="inset-y-0 left-0 flex items-center pl-3">
                                                    <Switch>
                                                        <Match when={item.completed}>
                                                            <span class="material-symbols-outlined dark:text-gray-300  text-gray-700 sm:text-sm">
                                                                done_all
                                                            </span>
                                                        </Match>
                                                        <Match when={!item.completed}>
                                                            <span class="material-symbols-outlined dark:text-gray-300  text-gray-700 sm:text-sm">
                                                                done
                                                            </span>
                                                        </Match>
                                                    </Switch>
                                                </button>
                                                <input ref={input} value={item.name}
                                                    type="text" style={{ "background": `rgba(${taskColour(item.completed)},1)` }} class="block w-full rounded-sm border-none py-1.5 pl-7 pr-20 dark:text-gray-100 text-gray-900  ring-none ">
                                                </input>
                                                <div class="inset-y-0 right-0 flex items-center">
                                                    <button onclick={() => deleteTask(item.id)}
                                                        class="flex ">
                                                        <span class="material-symbols-outlined  dark:text-gray-300  text-gray-700 sm:text-sm">
                                                            backspace
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center grow space-x-4">
                                            <div class="flex-shrink-0">
                                            </div>
                                            <div class="flex-1 min-w-0 grow">
                                            </div>
                                        </div>
                                    </li>
                                }
                            </For>
                            <AddButton props={{ addTask: setTasks, tasks: tasks.tasks }} />
                        </ul>
                    </div>
                </div>
            </div >
            <div class={`p-4 pl-12 ${uiState.notes ? "block" : "hidden"}  grow`}>
                <MarkDownEditor />
            </div>
            <div class={`absolute  ${uiState.timer ? "block" : "hidden"} z-10 left-0 bottom-0`}>
                <SetTimer />
            </div>
            <button onclick={() =>
                setDarkMode(!darkMode())
            }
                class="absolute z-10 right-0 bottom-0 m-4 border-none">
                <span class="material-symbols-outlined  dark:text-gray-300  text-gray-700 sm:text-sm">
                    contrast
                </span>
            </button>

        </section >
    );
}

function AddButton(props: any) {
    const [addTaskOpen, setAddTaskOpen] = createSignal(false)
    let input: HTMLInputElement
    let taskId: number = props.props.tasks.length
    const addTask = (text: any) => {
        props.props.addTask("tasks", [...props.props.tasks, { id: taskId++, name: text, completed: false }])
    }
    const handleEnter = (e: string, text: string) => {
        if (e === "Enter") {
            addTask(text)
            setAddTaskOpen(!addTaskOpen())
        }
    }
    return (
        <Switch fallback={<div></div>}>
            <Match when={addTaskOpen() == true}>
                <div class="h-full">
                    <label for="small-input" class="hidden h-full text-sm font-medium dark:text-gray-100  text-gray-900">Small input</label>
                    <div class="flex flex-row w-full h-full text-gray-900  dark:text-gray-100  gap-4 items-center">
                        <div class="p-2 rounded-sm flex w-full flex-row items-center">
                            <div class="flex w-full">
                                <div class="flex-row items-center border-b-2  flex mt-2 w-full  rounded-md gap-4">
                                    <span class="material-symbols-outlined dark:text-gray-300  text-gray-700 sm:text-sm  inset-y-0 left-0 flex items-center pl-3">
                                        east
                                    </span>
                                    <input ref={input} onkeydown={(e) => handleEnter(e.key, input.value)}
                                        type="text" class="block w-full rounded-sm border-none py-1.5 pl-4 pr-20 dark:bg-gray-900  dark:text-gray-100  text-gray-900 bg-gray-100  focus:ring-0 sm:text-sm sm:leading-6">
                                    </input>
                                    <div class="inset-y-0 right-0 flex items-center">
                                        <button onClick={() => {
                                            if (!input.value.trim()) {
                                                setAddTaskOpen(!addTaskOpen)
                                                return
                                            }
                                            addTask(input.value);
                                            setAddTaskOpen(!addTaskOpen())
                                            input.focus()
                                            input.value = "";
                                        }}>
                                            <span class="material-symbols-outlined  dark:text-gray-300  text-gray-700">
                                                add_circle
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center grow space-x-4">
                                <div class="flex-shrink-0">
                                </div>
                                <div class="flex-1 min-w-0 grow">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Match>
            <Match when={addTaskOpen() == false}>
                <div class='gap-2 h-full relative w-full grow flex p-4 my-2 border-dashed'>
                    <button class='flex gap-2' onclick={() => setAddTaskOpen(!addTaskOpen())} >
                        <span class=" material-symbols-outlined dark:text-gray-300  text-gray-700">
                            add
                        </span>
                        <p class='z-10'>Add Task</p>
                    </button>
                    <div class="bg-red-300 absolute top-0 left-0 h-full" style={{
                        "background": "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)"
                    }}></div>
                </div>
            </Match>
        </Switch >
    )
}



