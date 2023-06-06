// import cv2
// import numpy as np
// from numpy import linalg
// from numpy.polynomial import Polynomial as P
// import warnings

// Helper function for linear regression
function linearRegression(x, y) {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i][0];
        sumY += y[i];
        sumXY += x[i][0] * y[i];
        sumX2 += x[i][0] * x[i][0];
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const b = (sumXY - (sumX * sumY) / n) / (sumX2 - (sumX * sumX) / n);
    const a = meanY - b * meanX;

    return {
        coef_: [b],
        intercept_: a,
    };
}

function perpendicular_bisector(a, b) {
    let vx = b[0] - a[0];
    let vy = b[1] - a[1];
    var angle = Math.atan(-vy / vx) * (Math.PI / 180);
    return [vy, vx, angle];
}
function pythag(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function distance_between_line_and_point(p1, p2, p3) {
    function norm(vector) {
        var sumOfSquares = vector.reduce(function (accumulator, currentValue) {
            return accumulator + Math.pow(currentValue, 2);
        }, 0);

        return Math.sqrt(sumOfSquares);
    }
    function crossProduct(vector1, vector2) {
        var x1 = vector1[0];
        var y1 = vector1[1];
        var x2 = vector2[0];
        var y2 = vector2[1];
        
        return (x1 * y2) - (y1 * x2);
    }
    var d =
        (p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0]);
    d = d > 0 ? 1 : -1;
    var x = p2.map((value, index) => value - p1[index]);

    return crossProduct(p2.map((value, index) => value - p1[index]), p1.map((value, index) => value - p3[index]))/norm(p2.map((value, index) => value - p1[index]))*d;

}

function nose_line_angle(list_of_values) {
    // Fit the linear regression model
    const x = list_of_values.map((point) => [point[0]]);
    const y = list_of_values.map((point) => point[1]);
    const model = linearRegression(x, y);

    // Calculate the slope of the line connecting the points
    if (model.coef_[0] === 0) {
        return 0;
    } else {
        const slope = 1 / model.coef_[0];

        // Calculate the angle of the slope relative to the vertical axis (in degrees)
        const angle_radians = Math.atan(slope);
        const angle_degrees = angle_radians * (180 / Math.PI);
        return angle_degrees;
    }
}

function focus_tracking(
    left_iris_list,
    right_iris_list,
    chest_list,
    nose_list
) {
    var left_box = {
        x: Math.min(...left_iris_list.map((p) => p[0])),
        y: Math.min(...left_iris_list.map((p) => p[1])),
        width:
            Math.max(...left_iris_list.map((p) => p[0])) -
            Math.min(...left_iris_list.map((p) => p[0])),
        height:
            Math.max(...left_iris_list.map((p) => p[1])) -
            Math.min(...left_iris_list.map((p) => p[1])),
    };
    var right_box = {
        x: Math.min(...right_iris_list.map((p) => p[0])),
        y: Math.min(...right_iris_list.map((p) => p[1])),
        width:
            Math.max(...right_iris_list.map((p) => p[0])) -
            Math.min(...right_iris_list.map((p) => p[0])),
        height:
            Math.max(...right_iris_list.map((p) => p[1])) -
            Math.min(...right_iris_list.map((p) => p[1])),
    };

    var chest_z = chest_list.map((p) => p[2]);
    chest_list = chest_list.map((p) => [p[0], p[1]]);
    var eye_center = [
        (right_box.x + left_box.x + left_box.width) / 2.0,
        (right_box.y + left_box.y + left_box.height) / 2.0,
    ];
    var body_center = chest_list
        .reduce((acc, cur) => [acc[0] + cur[0], acc[1] + cur[1]], [0, 0])
        .map((p) => p / chest_list.length);

    var perp_bisect = perpendicular_bisector(chest_list[0], chest_list[1]);
    var body_slope = [perp_bisect[0], perp_bisect[1]];
    var chest_angle = perp_bisect[2];
    var new_point = [
        body_center[0] + body_slope[0] * 10,
        body_center[1] + body_slope[1] * 10,
    ];

    var eye_distance = distance_between_line_and_point(
        new_point,
        body_center,
        eye_center
    );
    var chest_distance = pythag(chest_list[0], chest_list[1]) / 2;

    var fundamental_ratio = Math.abs(
        eye_distance / chest_distance + Math.abs(chest_z[1] - chest_z[0])
    ); //max of 2
    if (fundamental_ratio > 2) fundamental_ratio = 2;
    var nose_angle = nose_line_angle(nose_list);
    var roll = Math.abs(chest_angle * 0.25 + nose_angle) / 60; //060
    if (roll > 1) roll = 1;
    var derived_focus = (roll * 2 + fundamental_ratio) / 4; //factor 2 together]
    return derived_focus;
}

function focus_from_result_obj(results, gpdict) {
    if (
        results.poseLandmarks == undefined ||
        results.faceLandmarks == undefined
    )
        return 0;
    const right_iris = gpdict.face.right_iris;
    const left_iris = gpdict.face.left_iris;
    const chest = gpdict.pose.chest;
    const nose_line = gpdict.face.nose_line;
    const right_iris_list = results.faceLandmarks
        .filter((land, index) => right_iris.includes(index))
        .map((land) => [land.x, land.y]);
    const left_iris_list = results.faceLandmarks
        .filter((land, index) => left_iris.includes(index))
        .map((land) => [land.x, land.y]);
    const chest_list = results.poseLandmarks
        .filter((land, index) => chest.includes(index))
        .map((land) => [land.x, land.y, land.z]);
    const nose_list = results.faceLandmarks
        .filter((land, index) => nose_line.includes(index))
        .map((land) => [land.x, land.y]);
    var focus = focus_tracking(
        left_iris_list,
        right_iris_list,
        chest_list,
        nose_list
    );
    return focus;
}
