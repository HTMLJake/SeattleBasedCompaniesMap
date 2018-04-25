import React, { Component } from "react";

class Sidebar extends Component {
    render() {
        return (
            <nav id="sidebar"className={"sidebar" + this.props.sidebar}>
            <header className="sidebar-header">
                <h2>Locations</h2>
                <p>Filter</p>
                <select value={this.props.filter} onChange={this.props.handleChange} className="select">
                <option value="all">All</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="tech">Tech</option>
                <option value="shopping">Shopping</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
                </select>
            </header>
            <menu id="list" className="list" ref="companysList">
                {this.props.sidebarList.map((val ,i) => {
                    return <li key={i} className="list-item" onClick={this.props.SidebarSelection}>{val.name}</li>
                })}
            </menu>
            </nav>
        )
    }
}

export default Sidebar;