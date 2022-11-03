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
  } from "@ubeac/svelte";
  import { onMount } from "svelte/internal";
  import "@ubeac/svelte/styles.css";

  let projects = [];

  let started = false;
  let startDate = null;

  function diffDate(prev) {
    if (!prev) return 0;
    if (prev === 0) return 0;
    const diff = new Date().valueOf() - prev;
    const minutes = Math.floor(diff / (1000 * 60));
    console.log({ minutes }, { diff, prev });

    return minutes;
  }

  function start() {
    started = true;
    startDate = new Date().valueOf() - request.time * 60 * 1000;
    localStorage.setItem("time-tracker-started", JSON.stringify(started));
    localStorage.setItem("time-tracker-start-date", JSON.stringify(startDate));

    console.log(startDate);
  }

  function stop() {
    started = false;
    request.time = diffDate(startDate);
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

  let newProjectName;
  let newProjectOpen = false;
  function add() {
    if (request.time === 0) return;
    if (request.description === "") return;
    if (request.project === "") return;

    times = [...times, request];
    request.time = 0;
    request.project = "";
    request.date = new Date().valueOf();
    request.description = "";
    request.removed = false;
    localStorage.setItem("time-tracker-times", JSON.stringify(times));
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

  let spentTime = 0;

  onMount(() => {
    const timesJSON = localStorage.getItem("time-tracker-times") ?? "[]";
    times = JSON.parse(timesJSON);
    const projectsJSON = localStorage.getItem("time-tracker-projects") ?? "[]";
    projects = JSON.parse(projectsJSON);
    const startedJSON = localStorage.getItem("time-tracker-started") ?? "false";
    started = JSON.parse(startedJSON);

    const startDateJSON = localStorage.getItem("time-tracker-start-date") ?? "";
    startDate = startDateJSON ? JSON.parse(startDateJSON) : 0;

    setInterval(() => {
      spentTime = diffDate(startDate);
    }, 10000); // 10 seconds
  });
</script>

<Dialog persistent open>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        <span class="title"> Time Tracker </span>
      </DialogTitle>
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
</Dialog>

<style>
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
</style>
