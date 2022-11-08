<script>
  import {
    Button,
    FormInput,
    FormSelect,
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogHeader,
    Accordions,
    Accordion,
    AccordionTitle,
    AccordionHeader,
    AccordionBody,
    Badge,
    Icon,
    Col,
    Row,
    FormFieldset,
    DialogClose,
    CardActions,
  } from "@ubeac/svelte";
  import { onMount } from "svelte/internal";
  import "@ubeac/svelte/styles.css";

  let projects = [];

  let started = false;
  let startDate = null;

  let interval = null;

  function diffDate(prev) {
    if (!prev) return { minutes: 0, seconds: 0 };
    if (prev === 0) return { minutes: 0, seconds: 0 };
    const diff = new Date().valueOf() - prev;
    const allSeconds = diff / 1000;

    const minutes = Math.floor(allSeconds / 60);

    return {
      minutes,
      seconds: Math.floor(allSeconds % 60),
    };
  }

  function start() {
    started = true;
    startDate = new Date().valueOf() - spentTime.minutes * 60 * 1000;
    localStorage.setItem("time-tracker-started", JSON.stringify(started));
    localStorage.setItem("time-tracker-start-date", JSON.stringify(startDate));
    interval = setInterval(() => {
      console.log("inside interval");
      spentTime = diffDate(startDate);
    }, 1000); // 1 seconds
  }

  function stop() {
    clearInterval(interval);
    started = false;
    spentTime.seconds = 0;
    request.time = diffDate(startDate).minutes;
    localStorage.setItem("time-tracker-started", "false");
    localStorage.setItem("time-tracker-start-date", "");
  }

  function addProject() {
    if (!newProjectName) return;
    projects = [...projects, newProjectName];
    localStorage.setItem("time-tracker-projects", JSON.stringify(projects));
    request.project = newProjectName;
    newProjectName = "";
    newProjectOpen = false;
  }

  let request = {
    project: "",
    description: "",
    time: 0,
    removed: false,
    date: new Date().valueOf(),
  };

  let viewTimesOpen = false;

  let newProjectName;
  let newProjectOpen = false;
  function add() {
    console.log("add", request);
    stop();

    if (spentTime.minutes === 0) return;
    if (request.description === "") return;
    if (request.project === "") return;

    request.time = spentTime.minutes;

    times = [...times, JSON.parse(JSON.stringify(request))];
    spentTime = {
      minutes: 0,
      seconds: 0,
    };

    request.time = 0;
    request.project = "";
    request.date = new Date().valueOf();
    request.description = "";
    request.removed = false;
    localStorage.setItem("time-tracker-times", JSON.stringify(times));

    logTimeOpen = false;
  }

  function removeTime(time) {
    times = times.map((t) => {
      if (t === time) return { ...t, removed: true };
      return t;
    });
    console.log(times);
    localStorage.setItem("time-tracker-times", JSON.stringify(times));
  }

  let times = [];

  let spentTime = {
    minutes: 0,
    seconds: 0,
  };

  let logTimeOpen = false;

  onMount(() => {
    const timesJSON = localStorage.getItem("time-tracker-times") ?? "[]";
    times = JSON.parse(timesJSON);
    const projectsJSON = localStorage.getItem("time-tracker-projects") ?? "[]";
    projects = JSON.parse(projectsJSON);
    const startedJSON = localStorage.getItem("time-tracker-started") ?? "false";
    started = JSON.parse(startedJSON);

    const startDateJSON = localStorage.getItem("time-tracker-start-date") ?? "";
    startDate = startDateJSON ? JSON.parse(startDateJSON) : 0;

    if (started)
      interval = setInterval(() => {
        console.log("inside interval");
        spentTime = diffDate(startDate);
      }, 1000);
  });
</script>

<div class="flex flex-col h-full">
  <div
    class="w-screen h-20 bg-blue-500 flex flex-col items-center justify-center text-2xl text-white font-bold"
  >
    Time Tracker
  </div>
  <div class="flex flex-col h-full p-3">
    <div
      class="flex flex-col items-center justify-center shadow-sm text-7xl rounded !border border-gray-200 p-3"
      class:bg-blue-animated={started}
      class:text-gray-800={!started}
      class:text-blue-50={started}
      class:bg-white={!started}
    >
      <button
        disabled={started}
        on:click={() => (spentTime.minutes = spentTime.minutes + 1)}
        class="bttn"
        class:!opacity-10={started}
      >
        <svg width="32" height="32" viewBox="0 0 16 16"
          ><path
            fill="currentColor"
            fill-rule="evenodd"
            d="M7.776 5.553a.5.5 0 0 1 .448 0l6 3a.5.5 0 1 1-.448.894L8 6.56L2.224 9.447a.5.5 0 1 1-.448-.894l6-3z"
          /></svg
        ></button
      >
      <span class="my-8 mb-6">
        {spentTime.minutes}
        <span class="text-lg -ml-2 font-light">{spentTime.seconds}</span>
      </span>
      <button
        disabled={started}
        on:click={() => (spentTime.minutes = spentTime.minutes - 1)}
        class="bttn"
        class:!opacity-10={started}
      >
        <svg width="32" height="32" viewBox="0 0 16 16"
          ><path
            fill="currentColor"
            fill-rule="evenodd"
            d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67z"
          /></svg
        >
      </button>
    </div>

    {#if started}
      <button on:click={stop} class="bttn bttn-green text-xl font-bold mt-3">
        Pause
      </button>
    {:else}
      <button on:click={start} class="bttn bttn-green text-xl font-bold mt-3">
        Start
      </button>
    {/if}

    <div class="flex-1" />
    <div class="flex gap-2 w-full">
      <button on:click={() => (logTimeOpen = true)} class="bttn bttn-blue">
        Save
      </button>
      <button
        on:click={() => (viewTimesOpen = true)}
        class="bttn !w-full !sm:w-1/4"
      >
        View All
      </button>
    </div>
  </div>
</div>
<Dialog bind:open={logTimeOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add new Time</DialogTitle>
      <CardActions>
        <button
          disabled={newProjectOpen}
          class:opacity-20={newProjectOpen}
          on:click={() => (newProjectOpen = true)}
          class="bttn bttn-blue !py-2"
        >
          Create Project
        </button>
      </CardActions>
    </DialogHeader>
    <DialogClose />
    <DialogBody>
      <div
        class="flex gap-1 transition-height duration-200 h-9 overflow-hidden"
        class:mb-3={newProjectOpen}
        class:h-0={!newProjectOpen}
      >
        <input
          class="py-2 px-3 shadow-sm w-full outline-none border border-gray-200"
          placeholder="Enter project's name..."
          bind:value={newProjectName}
        />

        <button
          class="bttn bttn-green !p-2 !text-base !w-min"
          on:click={addProject}
        >
          <svg width="24" height="24" viewBox="0 0 2048 2048"
            ><path
              fill="currentColor"
              d="M640 1755L19 1133l90-90l531 530L1939 275l90 90L640 1755z"
            /></svg
          >
        </button>
        <button
          class="bttn bttn-red !p-2 !text-base !w-min"
          on:click={() => (newProjectOpen = false)}
        >
          <svg width="24" height="24" viewBox="0 0 2048 2048"
            ><path
              fill="currentColor"
              d="m1115 1024l690 691l-90 90l-691-690l-691 690l-90-90l690-691l-690-691l90-90l691 690l691-690l90 90l-690 691z"
            /></svg
          >
        </button>
      </div>
      <FormSelect
        placeholder="Choose a project"
        items={projects}
        bind:value={request.project}
      />
      <FormInput
        placeholder="Enter Task's description..."
        bind:value={request.description}
      />

      <button on:click={add} class="bttn bttn-blue">Add</button>
    </DialogBody>
  </DialogContent>
</Dialog>

<Dialog bind:open={viewTimesOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Saved Times</DialogTitle>
    </DialogHeader>
    <DialogClose />
    <DialogBody>
      <Row>
        {#each times as time}
          {#if !time.removed}
            <Col class="relative border p-2 mb-1" cols="12">
              <h3>
                {time.project}
                <Badge color="primary" ghost>{time.time}m</Badge>
              </h3>
              <div>{time.description}</div>

              <button
                tabindex="-1"
                on:click={() => removeTime(time)}
                class="u-button u-button-icon close"
              >
                <Icon name="x" />
              </button>
            </Col>
          {/if}
        {/each}
      </Row>
    </DialogBody>
  </DialogContent>
</Dialog>

<!-- <Dialog persistent>
  <DialogContent>
    <DialogHeader>
      {#if started}
        <Badge color="success" ghost>
          {spentTime}m
        </Badge>
      {/if}
    </DialogHeader>

    <DialogBody>
      <Row>
        <FormSelect
          placeholder="select project"
          cols="grow"
          items={projects}
          bind:value={request.project}
        />
        <Col cols="2">
          <Button on:click={() => (newProjectOpen = true)}>
            <Icon name="plus" />
          </Button>
        </Col>
        {#if newProjectOpen}
          <Row>
            <FormInput
              cols="9"
              bind:value={newProjectName}
              placeholder="new project name"
            />
            <Col cols="2">
              <Button
                on:click={() => {
                  newProjectName = "";
                  newProjectOpen = false;
                }}
              >
                <Icon name="minus" />
              </Button>
            </Col>

            <Col cols="1">
              <Button on:click={addProject}>
                <Icon name="plus" />
              </Button>
            </Col>
          </Row>
        {/if}
        <FormInput
          cols="12"
          placeholder="Enter task description"
          bind:value={request.description}
        />
        <FormInput
          type="number"
          disabled={started}
          placeholder="Enter time that you spent on this task"
          bind:value={request.time}
        />
      </Row>

      <Row>
        <Accordions>
          <Accordion>
            <AccordionHeader>
              <AccordionTitle>Previously added times</AccordionTitle>
            </AccordionHeader>
            <AccordionBody>
              {#each times as time}
                {#if !time.removed}
                  <Col class="relative border p-2 mb-1" cols="12">
                    <h3>
                      {time.project}
                      <Badge color="primary" ghost>{time.time}m</Badge>
                    </h3>
                    <div>{time.description}</div>

                    <button
                      tabindex="-1"
                      on:click={() => removeTime(time)}
                      class="u-button u-button-icon close"
                    >
                      <Icon name="x" />
                    </button>
                  </Col>
                {/if}
              {/each}
            </AccordionBody>
          </Accordion>
        </Accordions>
      </Row>
    </DialogBody>
    <DialogFooter>
      {#if !started}
        <Button on:click={start} color="success">Start</Button>
      {:else}
        <Button on:click={stop} color="danger">Stop</Button>
      {/if}
      <Button color="primary" on:click={add}>Add</Button>
    </DialogFooter>
  </DialogContent>
</Dialog> -->
<style lang="postcss" global>
  .close {
    position: absolute;
    right: 0;
    top: 0;
    border: none;
  }
  :global(.relative) {
    position: relative;
  }

  :global(.u-dialog-header) {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  :global(.u-dialog-container) {
    margin: 0;
    max-width: 100%;
    min-height: 100vh !important;
  }

  :global(.u-dialog-content) {
    @apply rounded-b-none w-screen;
  }
  :global(.u-dialog-body) {
    @apply max-h-100 overflow-auto;
  }
  :global(.u-dialog) {
    @apply h-full block duration-300 transition-all backdrop-filter pointer-events-none transform-gpu translate-y-full backdrop-blur-0 opacity-0;
  }

  :global(.u-dialog-open) {
    @apply backdrop-blur-sm opacity-100 transform translate-y-0;
  }

  :global(.u-dialog-backdrop) {
    @apply transition-all duration-300 block pointer-events-none;
  }
  :global(.u-dialog-backdrop-open) {
    @apply pointer-events-auto;
  }

  :global(.u-dialog-placement-top) :global(.u-dialog-container) {
    display: flex;
    align-items: end;
    min-height: calc(100% - var(--u-modal-margin) * 2);
  }

  :global(.u-form-field) {
    @apply shadow-md;
  }

  :global(.u-form-fieldset) {
    margin-bottom: 0px !important;
    @apply shadow-md;
  }
  :global(.u-form-fieldset) > :global(fieldset) {
    margin-bottom: 0px !important;
  }

  .bg-blue-animated {
    animation: change-color 1s ease infinite;
  }

  @keyframes change-color {
    from {
      background-color: #50b0f0;
    }
    to {
      background-color: #4090f0;
    }
  }

  .bttn {
    @apply flex outline-blue-600 items-center justify-center w-full py-3 px-4 rounded shadow-md border border-gray-300 text-gray-800 bg-white;
  }

  .bttn:focus {
    @apply ring-4 ring-gray-200;
  }

  .bttn-green {
    @apply bg-green-500 text-white;
  }
  .bttn-blue {
    @apply bg-blue-500 text-white;
  }

  .bttn-red {
    @apply bg-red-500 text-white;
  }
</style>
