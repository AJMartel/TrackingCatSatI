import React, { PureComponent, Fragment } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { connect } from "react-redux";
import { clearGraph } from "../../actions/catwan-actions";
import store from "../../store";

class SimpleLineChart extends PureComponent {
  static jsfiddleUrl = "https://jsfiddle.net/alidingling/c1rLyqj1/";

  clearGraph(graphName) {
    console.log(`clear graph ${graphName}`);
    store.dispatch(clearGraph(graphName));
  }

  render() {
    return (
      <Fragment>
        <div
          className="title-card-column"
          Style={`background-color: ${this.props.barColor} !important;`}
        >
          <p className="p-title-grph">
            {this.props.title}
            <span
              onClick={() => this.clearGraph(this.props.graphName)}
              className="refresh--btn"
            >
              clear
            </span>
          </p>
        </div>
        <ResponsiveContainer height="400px" width="100%" aspect={4.0}>
          <AreaChart
            data={this.props.data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={this.props.dataKeyA}
              stackId="1"
              stroke={
                this.props.strokeColorA ? this.props.strokeColorA : "#2ec54d"
              }
              fill={this.props.fillColorA ? this.props.fillColorA : "#70d69f"}
            />
            <Area
              type="monotone"
              dataKey={this.props.dataKeyB}
              stackId="1"
              stroke={
                this.props.strokeColorB ? this.props.strokeColorB : "#7128fb"
              }
              fill={this.props.fillColorB ? this.props.fillColorB : "#8438f8"}
            />
            <Area
              type="monotone"
              dataKey={this.props.dataKeyC}
              stackId="1"
              stroke={
                this.props.strokeColorC ? this.props.strokeColorC : "#f77525"
              }
              fill={this.props.fillColorC ? this.props.fillColorC : "#f9ca59"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Fragment>
    );
  }
}

export default connect(clearGraph)(SimpleLineChart);
