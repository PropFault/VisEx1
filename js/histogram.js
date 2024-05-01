let histGroup;
let svg;
const margin = {top: 12, right: 30, bottom: 30, left: 50};
const width = 600 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

function initHistogram() {
    // append the svg and group to the container for the histogram
    svg = d3.select("#tfContainer")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    histGroup = svg.append("g")
            .attr("fill", "white");

    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width - margin.right]);
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call((g) => g.append("text")
            .attr("x", width - margin.right + 6)
            .attr("y", margin.bottom - 4)
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .text("density"));
}

let yScale;

function updateHistogram() {

    const bins = d3.bin()
        .thresholds(100)
        .domain([0, 1])(volume.voxels);

    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width - margin.right]);

    const y = d3.scalePow()
        .domain([0, d3.max(bins, (d) => d.length)])
        .range([height - margin.bottom, margin.top])
        .exponent(0.3);

    if (!yScale) {
        yScale = svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call((g) => g.append("text")
                .attr("x", 0)
                .attr("y", 8)
                .attr("fill", "white")
                .attr("text-anchor", "start")
                .text("amount"))
            .call(y);
    } else {
        yScale.transition().duration(750)
            .call(d3.axisLeft(y));
    }

    const t = histGroup.transition()
        .duration(750);

    histGroup.selectAll("rect")
    .data(bins)
    .join(
        enter => enter.append("rect")
                .attr("x", (d) => x(d.x0) + 1)
                .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
                .attr("y", y(0))
                .attr("height", 0)
            .call(enter => enter.transition(t)
                .attr("y", (d) => y(d.length))
                .attr("height", (d) => y(0) - y(d.length))),
        update => update.call(update => update.transition(t)
                .attr("y", (d) => y(d.length))
                .attr("height", (d) => y(0) - y(d.length))),
        exit => exit.remove()
    );
}

