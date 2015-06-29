
function initialize() {
    // Copy coord list into local storage
    coordList = humanoid.skinCoord.point;
}
// Transforms the vertices related to a joint
function Transform() {
    // Make sure that this is a joint
    var iNumJoints = humanoid.joints.length;
    var bIsJoint = false;
    var j;
    for (j=0; (j<iNumJoints) && (bIsJoint==false); j++) {
        if (humanoid.joints[j].name == joint.name) bIsJoint = true;
    }
    // If it is, we process the data
    if (bIsJoint) {
        // Read in current joint
        var currentJoint = joint;
        // Read in current matrix
        var currentMatrix = new VrmlMatrix(); // TODO not a legal function in X3D
        currentMatrix.setTransform(translation,
          rotation,
          scale,
          new SFRotation(1,0,0,0),
          new SFVec3f(0,0,0));
        // Create matrix corresponding to this joints transform
        var newMatrix = new VrmlMatrix(); // TODO not a legal function in X3D
        newMatrix.setTransform(currentJoint.translation,
          currentJoint.rotation,
          currentJoint.scale,
          currentJoint.scaleOrientation,
          currentJoint.center);
        // Update current matrix with matrix from this joint
        currentMatrix = newMatrix.multRight(currentMatrix);
        // Transform all vertices associated with this joint
        //          var iNumAffectedVertices = currentJoint.affectedVertices.length;
        var iNumAffectedVertices = currentJoint.skinCoordIndex.length;
        var v;
        for (v=0; v<iNumAffectedVertices; v++) {
            //             var vertex = currentJoint.affectedVertices[v];
            //             var weight = currentJoint.vertexWeights[v];
            var vertex = currentJoint.skinCoordIndex[v];
            var weight = currentJoint.skinCoordWeight[v];
            var newVertex = currentMatrix.multVecMatrix(coordList[vertex]).multiply(weight);
            humanoid.skinCoord.point[vertex] = humanoid.skinCoord.point[vertex].add(newVertex);
        }
        // Transform all children
        var children = currentJoint.children;
        var iNumChildren = children.length;
        var c;
        for (c=0; c<iNumChildren; c++) {
            joint = children[c];
            currentMatrix.getTransform(translation,rotation,scale);
            Transform();
        }
    }
}
// Update event handler
function update(value,time) {
    // Zero output data.
    var iNumVertices = humanoid.skinCoord.point.length;
    var v;
    for (v=0; v<iNumVertices; v++) {
        humanoid.skinCoord.point[v].x = 0;
        humanoid.skinCoord.point[v].y = 0;
        humanoid.skinCoord.point[v].z = 0;
    }
    // Initialise transform data
    translation = new SFVec3f(0,0,0);
    scale       = new SFVec3f(1,1,1);
    rotation    = new SFRotation(0,0,1,0);
    // First (and only) item in humanoidBody should be the HumanoidRoot.
    // This is stored as the joint we want to do next
    // This could do with being more robust, rather than a'should be ok'.
    //       joint = humanoid.humanoidBody[0];
    joint = humanoid.skeleton[0];
    // Call transform function
    Transform();
}