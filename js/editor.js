class Editor {

    margin = {top: 12, right: 30, bottom: 120, left: 50};
    width = 600 - this.margin.left - this.margin.right;
    height = 600 - this.margin.top - this.margin.bottom;

    constructor(updateFunction) {
        this.svg = d3.select("#tfContainer")
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
        this.xAxis = d3.scaleLinear()
            .domain([0, 1])
            .range([this.margin.left, this.width - this.margin.right]);

        this.yAxis = d3.scaleLinear()
            .domain([0, 1])
            .range([this.height - this.margin.bottom, this.margin.top]);

        this.data = [
            { x: this.xAxis(0.5), y: this.yAxis(0.8), color: new THREE.Color(1, 1, 1) }
        ];

        this.updateFunction = updateFunction;
    }

    getSurfaces() {
        return this.data.map(d => { return { 
            iso: this.xAxis.invert(d.x),
            opacity: this.yAxis.invert(d.y),
            color: d.color
        }});
    }

    drawEditor() {

        d3.select("#addSelector").on("click", () => this.addSelector());

        d3.select("#tfColors").selectAll("li")
            .data(this.data)
            .join("li")
                .call(li => li.append("input")
                    .attr("type", "color")
                    .attr("value", d => "#" + d.color.getHexString())
                    .on("change", (e, d) => {
                        d.color = new THREE.Color(e.target.value);
                        this.updateFunction();
                    }))
                .call(li => li.append("button")
                    .text("x")
                    .on("click", (_, d) => this.removeSelector(d)));

        d3.select("#tfColors").select("li").select("button").attr("disabled", true);

        this.svg.selectAll(".selector")
            .data(this.data)
            .join("g")
            .classed("selector", true)
                .call(g => g.append("line")
                    .attr("x1", d => d.x)
                    .attr("y1", d => d.y)
                    .attr("x2", d => d.x)
                    .attr("y2", this.yAxis(0))
                    .attr("stroke", "white"))
                .call(g => g.append("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 10)
                    .attr("fill", "white")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended)
                ))
                .call(g => g.append("text")
                    .text((_, i) => i + 1)
                    .attr("color", "black")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y + 1)
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended)));

        this.initHistogram();

        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yAxis))
            .call((g) => g.append("text")
                .attr("x", -45)
                .attr("y", -30)
                .attr("fill", "white")
                .attr("text-anchor", "start")
                .attr("transform", "rotate(-90)")
                .text("intensity"));

        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xAxis))
            .call((g) => g.append("text")
                .attr("x", this.width - this.margin.right + 6)
                .attr("y", 30)
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .text("density"));
    }

    addSelector() {
        this.data.push({ x: this.xAxis(0.5), y: this.yAxis(0.8), color: new THREE.Color(1, 1, 1) });

        this.updateEditor();
        this.updateFunction();

        if (this.data.length >= 5) {
            d3.select("#addSelector").attr("disabled", true);
        } else {
            console.log("hi")
            d3.select("#tfColors").select("li").select("button").attr("disabled", null);
        }
    }

    removeSelector(d) {
        this.data = this.data.filter(x => x !== d);

        this.updateEditor();
        this.updateFunction();

        if (this.data.length <= 1) {
            d3.select("#tfColors").select("li").select("button").attr("disabled", true);
        } else {
            d3.select("#addSelector").attr("disabled", null);
        }
    }

    updateEditor() {
        d3.select("#tfColors").selectAll("li").remove();

        d3.select("#tfColors").selectAll("li")
            .data(this.data)
            .join("li")
                .call(li => li.append("input")
                    .attr("type", "color")
                    .attr("value", d => "#" + d.color.getHexString())
                    .on("change", (e, d) => {
                        d.color = new THREE.Color(e.target.value);
                        this.updateFunction();
                    }))
                .call(li => li.append("button")
                    .text("x")
                    .on("click", (_, d) => this.removeSelector(d)));

        this.svg.selectAll(".selector").remove();

        this.svg.selectAll(".selector")
            .data(this.data)
            .join("g")
            .classed("selector", true)
                .call(g => g.append("line")
                    .attr("x1", d => d.x)
                    .attr("y1", d => d.y)
                    .attr("x2", d => d.x)
                    .attr("y2", this.yAxis(0))
                    .attr("stroke", "white"))
                .call(g => g.append("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 10)
                    .attr("fill", "white")
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended)
                ))
                .call(g => g.append("text")
                    .text((_, i) => i + 1)
                    .attr("color", "black")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y + 1)
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended)));
    }

    initHistogram() {
        this.histGroup = this.svg.append("g")
                .attr("fill", "#555");
    }

    updateHistogram() {

        const bins = d3.bin()
            .thresholds(100)
            .domain([0, 1])(volume.voxels);

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([this.margin.left, this.width - this.margin.right]);

        const y = d3.scalePow()
            .domain([0, d3.max(bins, (d) => d.length)])
            .range([this.height - this.margin.bottom, this.margin.top])
            .exponent(0.3);

        const t = this.histGroup.transition()
            .duration(750);

        this.histGroup.selectAll("rect")
        .data(bins)
        .join(
            enter => enter.append("rect")
                    .attr("x", (d) => x(d.x0) + 1)
                    .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
                    .attr("y", y(0))
                    .attr("height", 0)
                .call(enter => enter.transition(t)
                    .attr("height", (d) => y(0) - y(d.length))),
            update => update.call(update => update.transition(t)
                    .attr("height", (d) => y(0) - y(d.length))),
            exit => exit.remove()
        );
    }

}


function dragstarted(_event, _d) {
    d3.select(this.parentNode).select("circle").raise().attr("fill", "#eee");
    d3.select(this.parentNode).select("text").raise();
}

function dragged(event, d) {
    d.x = event.x;
    d.y = event.y;

    if (editor.xAxis.invert(d.x) < 0) d.x = editor.xAxis(0);
    if (editor.xAxis.invert(d.x) > 1) d.x = editor.xAxis(1);

    if (editor.yAxis.invert(d.y) < 0) d.y = editor.yAxis(0);
    if (editor.yAxis.invert(d.y) > 1) d.y = editor.yAxis(1);

    d3.select(this.parentNode).select("circle").attr("cx", d.x).attr("cy", d.y);
    d3.select(this.parentNode).select("line").attr("x1", d.x).attr("x2", d.x).attr("y1", d.y);
    d3.select(this.parentNode).select("text").raise().attr("x", d.x).attr("y", d.y + 1);

    editor.updateFunction();
}

function dragended(_event, _d) {
    d3.select(this.parentNode).select("circle").attr("fill", "white");
}
